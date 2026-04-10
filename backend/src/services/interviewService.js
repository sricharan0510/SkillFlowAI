const Interview = require("../models/interviewModel");
const aiService = require("../utils/aiService"); 

const parseAIResponse = (text) => {
  const normalizeJSON = (raw) => {
    let cleaned = raw.trim();

    if (!cleaned) {
      throw new Error("Empty AI response");
    }

    cleaned = cleaned.replace(/```(?:json)?\n?/, "").replace(/```\s*$/, "").trim();
    cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

    const startIndex = Math.min(
      ...[cleaned.indexOf('{'), cleaned.indexOf('[')].map((idx) => (idx === -1 ? Infinity : idx))
    );
    const endIndex = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

    if (startIndex === Infinity || endIndex === -1 || endIndex < startIndex) {
      throw new Error("No JSON structure found in AI response");
    }

    cleaned = cleaned.slice(startIndex, endIndex + 1).trim();
    cleaned = cleaned.replace(/,\s*(?=[}\]])/g, "");

    let result = "";
    let inString = false;
    let escaped = false;

    const nextNonWhitespace = (str, pos) => {
      for (let i = pos; i < str.length; i += 1) {
        if (!/\s/.test(str[i])) return str[i];
      }
      return null;
    };

    for (let i = 0; i < cleaned.length; i += 1) {
      const char = cleaned[i];

      if (char === '"' && !escaped) {
        if (!inString) {
          inString = true;
          result += char;
        } else {
          const nextChar = nextNonWhitespace(cleaned, i + 1);
          const isClosingQuote = nextChar === null || [',', '}', ']'].includes(nextChar);
          if (isClosingQuote) {
            inString = false;
            result += char;
          } else {
            result += '\\"';
          }
        }
      } else {
        result += char;
        escaped = char === '\\' && !escaped;
      }

      if (char !== '\\') {
        escaped = false;
      }
    }

    return result;
  };

  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON structure found in AI response");
    const repaired = normalizeJSON(match[0]);
    return JSON.parse(repaired);
  } catch (error) {
    console.error("JSON Parsing failed for AI output:", text);
    throw new Error("Failed to parse AI response.");
  }
};

exports.startInterview = async ({ number = 5, role, difficulty, experience }) => {
  const prompt = `
You are an expert technical interviewer. Generate EXACTLY ${number} interview questions.
Role: ${role}
Difficulty: ${difficulty}
Experience: ${experience}

Rules:
1. Progressive difficulty (start basic, get harder).
2. Mix behavioral and technical questions.
3. Respond ONLY with a raw JSON array. Do not include markdown formatting or conversational text.

Format strictly as:
[
  { "question": "...", "type": "technical", "difficulty": "medium" }
]
`;

  const aiResponse = await aiService.generateText(prompt);
  const questions = parseAIResponse(aiResponse);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI generated invalid questions format.");
  }

  const session = await Interview.create({
    role,
    difficulty,
    experience,
    questions,
    currentQuestionIndex: 0,
    totalScore: 0,
    status: "active"
  });

  return {
    sessionId: session._id,
    question: questions[0],
    index: 0,
    total: questions.length
  };
};

exports.submitAnswer = async ({ sessionId, answer }) => {
  const session = await Interview.findById(sessionId);

  if (!session) throw new Error("Session not found");
  if (session.status === "completed") throw new Error("This interview is already completed.");

  const index = session.currentQuestionIndex;
  
  if (index >= session.questions.length) {
    session.status = "completed";
    await session.save();
    return { completed: true, message: "Interview completed. Awaiting final report." };
  }

  const currentQuestion = session.questions[index];

  const prompt = `
You are a strict but fair technical interview evaluator.
Evaluate the candidate's answer.

Question: ${currentQuestion.question}
Candidate Answer: ${answer}

Rules:
1. Score from 0 to 10 (integers only).
2. Provide concise, constructive feedback.
3. Suggest a specific area of improvement.
4. Respond ONLY with a raw JSON object. Do not use markdown blocks.

Format strictly as:
{ "score": 8, "feedback": "...", "improvement": "..." }
`;

  const aiResponse = await aiService.generateText(prompt);
  const evaluation = parseAIResponse(aiResponse);

  session.questions[index].answer = answer;
  session.questions[index].score = evaluation.score || 0;
  session.questions[index].feedback = evaluation.feedback || "No feedback provided.";
  session.questions[index].improvement = evaluation.improvement || "N/A";

  session.totalScore += (evaluation.score || 0);
  session.currentQuestionIndex += 1;

  const isFinished = session.currentQuestionIndex >= session.questions.length;
  if (isFinished) {
    session.status = "completed";
  }

  await session.save();

  if (isFinished) {
    return {
      completed: true,
      message: "Interview completed. Please call the finish endpoint to generate the report.",
      lastEvaluation: evaluation
    };
  }

  return {
    completed: false,
    question: session.questions[session.currentQuestionIndex],
    index: session.currentQuestionIndex,
    total: session.questions.length,
    feedback: evaluation 
  };
};

exports.getInterview = async (id) => {
  const session = await Interview.findById(id);
  if (!session) throw new Error("Interview not found");
    return session;
};

exports.finishInterview = async (sessionId) => {
  const session = await Interview.findById(sessionId);

  if (!session) throw new Error("Session not found");

  if (session.report) {
    return {
        score: parseFloat((session.totalScore / session.questions.length).toFixed(2)),
        ...session.report,
        questions: session.questions
    }
  }

  const avgScore = session.questions.length > 0 
    ? parseFloat((session.totalScore / session.questions.length).toFixed(2))
    : 0;

  const qaHistory = session.questions.map(q => ({
    Q: q.question,
    A: q.answer,
    Score: q.score
  }));

  const prompt = `
You are an expert technical recruiter analyzing an interview performance.
Average Score: ${avgScore}/10
Questions and Answers History:
${JSON.stringify(qaHistory)}

Provide a comprehensive final report. 
Respond ONLY with a raw JSON object. Do not use markdown blocks.

Format strictly as:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["...", "..."]
}
`;

  const aiResponse = await aiService.generateText(prompt);
  let report;

  try {
    report = parseAIResponse(aiResponse);
  } catch (error) {
    console.error("[Interview] Final report parse failed:", error.message);
    report = {
      strengths: ["Unable to generate strengths due to AI response parsing issues."],
      weaknesses: ["AI final report generation failed. Please retry or try again later."],
      recommendations: ["Retry generating the final report."]
    };
  }

  session.status = "completed";
  session.report = report;
  await session.save();

  return {
    score: avgScore,
    ...report,
    questions: session.questions
  };
};