const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.generateSummaryAI = async (text, mode = "entire", topic = "") => {

  const candidateModels = [
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-preview-02-05"
  ];

  let prompt = "";

  if (mode === "specific" && topic) {
    prompt = `
        Task: Extract and summarize information strictly related to the topic: "${topic}" from the source text.
        
        STRICT OUTPUT RULES:
        1. NO conversational filler (e.g., "Here is the summary", "Let's dive in", "Imagine").
        2. Start immediately with the topic heading.
        3. Keep definitions to 1-2 simple sentences.
        4. Use code blocks for any syntax or formulas.

        REQUIRED OUTPUT FORMAT:
        ## ${topic}
        **Definition:** [Concise definition]

        ### Key Points
        * [Point 1 - bold key terms]
        * [Point 2]
        * [Point 3]

        ### Syntax / Example
        \`\`\`sql
        [Provide a code snippet or formula if present in text]
        \`\`\`

        ### Important Note
        > [One critical takeaway or warning if applicable]

        Source Text:
        "${text}"
      `;
  } else {
    prompt = `
        Task: Convert the source text into a high-density "Exam Cheat Sheet".
        
        STRICT OUTPUT RULES:
        1. NO intro/outro text (e.g., "I have summarized the document"). Start directly with Section 1.
        2. NO long paragraphs. Use bullet points for 95% of the content.
        3. Prioritize definitions, differences, and syntax over theoretical explanations.

        REQUIRED OUTPUT FORMAT:

        # Core Concepts
        [Group by theme/chapter. Use sub-bullets.]
        * **[Concept A]**: [Definition/Explanation]
        * **[Concept B]**: [Definition/Explanation]

        # Fast Facts & Formulas
        [Extract list of dates, commands, formulas, or specific rules]
        * **[Term]**: [Fact]
        * **[Term]**: [Fact]

        # Comparisons (If applicable)
        [Create a simple comparison list, e.g., TCP vs UDP, Inner vs Outer Join]
        * **[Item A]**: [Trait] vs **[Item B]**: [Trait]

        Source Text:
        "${text}"
      `;
  }

  for (const modelName of candidateModels) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      console.log(`Success with ${modelName}!`);
      return response.text();

    } catch (error) {
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes("429") || errorMsg.includes("limit");
      const isNotFoundError = errorMsg.includes("404") || errorMsg.includes("not found");
      const isOverloaded = errorMsg.includes("503") || errorMsg.includes("overloaded");

      if (isQuotaError || isNotFoundError || isOverloaded) {
        console.warn(`Failed with ${modelName}. Switching to next model...`);
        continue;
      }

      throw new Error(`AI Service Critical Error (${modelName}): ${error.message}`);
    }
  }

  throw new Error("All AI models failed. Please check your API Key billing status.");
};

exports.generateExamQuestions = async (text, config, numQuestions = 20) => {
  const candidateModels = [
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite-preview-02-05"
  ];

  // Build question type requirements
  const selectedTypes = Object.keys(config.questionTypes).filter(type => config.questionTypes[type]);
  const numTypes = selectedTypes.length;
  if (numTypes === 0) return [];

  // Calculate distribution
  const base = Math.floor(numQuestions / numTypes);
  const remainder = numQuestions % numTypes;
  const typeCounts = {};
  selectedTypes.forEach((type, index) => {
    typeCounts[type] = base + (index < remainder ? 1 : 0);
  });

  const typeDescriptions = {
    mcq: "Multiple Choice Questions (MCQ)",
    trueFalse: "True/False Questions",
    fillBlanks: "Fill in the Blanks",
    shortAns: "Short Answer Questions"
  };

  const requirements = selectedTypes.map(type => `${typeCounts[type]} ${typeDescriptions[type]}`).join(", ");

  let scopeText = "";
  if (config.scope === "specific" && config.specificTopic) {
    scopeText = `Focus ONLY on content related to: "${config.specificTopic}". Extract relevant information from the text about this topic.`;
  } else {
    scopeText = "Cover the entire content provided.";
  }

  const prompt = `
    Task: Generate ${numQuestions} exam questions from the provided text.

    REQUIREMENTS:
    - ${scopeText}
    - Difficulty level: ${config.difficulty}
    - Generate exactly: ${requirements}
    - Questions should test understanding, not just memorization
    - For MCQ: Provide exactly 4 options, only one correct, mark the correct one
    - For True/False: Make some true, some false
    - For Fill in the Blanks: Use single words or short phrases, provide the correct answer
    - For Short Answer: Expect 1-2 sentence answers, provide the correct answer

    OUTPUT FORMAT: Return ONLY a valid JSON array. No explanations, no markdown, just the JSON array.

    Example format:
    [
      {
        "type": "mcq",
        "text": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correct": "Paris"
      },
      {
        "type": "trueFalse",
        "text": "Paris is the capital of France.",
        "correct": true
      },
      {
        "type": "fillBlanks",
        "text": "The capital of France is ______.",
        "correct": "Paris"
      },
      {
        "type": "shortAns",
        "text": "What is the capital of France?",
        "correct": "Paris is the capital of France."
      }
    ]

    Source Text:
    "${text}"
  `;

  for (const modelName of candidateModels) {
    try {
      console.log(`Trying model: ${modelName} for exam generation...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Try to parse the JSON
      try {
        let responseText = response.text().trim();
        
        // Remove any markdown code blocks if present
        if (responseText.startsWith('```json')) {
          responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (responseText.startsWith('```')) {
          responseText = responseText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        const questions = JSON.parse(responseText);
        if (Array.isArray(questions) && questions.length > 0) {
          // Validate each question has required fields
          const validQuestions = questions.filter(q => 
            q.type && q.text && 
            (q.type === 'trueFalse' ? typeof q.correct === 'boolean' : q.correct !== undefined)
          );
          
          if (validQuestions.length > 0) {
            console.log(`Success with ${modelName}! Generated ${validQuestions.length} valid questions.`);
            return validQuestions;
          }
        }
      } catch (parseError) {
        console.warn(`JSON parse error with ${modelName}: ${parseError.message}`);
        console.warn(`Response text: ${response.text().substring(0, 200)}...`);
        continue;
      }

    } catch (error) {
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes("429") || errorMsg.includes("limit");
      const isNotFoundError = errorMsg.includes("404") || errorMsg.includes("not found");
      const isOverloaded = errorMsg.includes("503") || errorMsg.includes("overloaded");

      if (isQuotaError || isNotFoundError || isOverloaded) {
        console.warn(`Failed with ${modelName}. Switching to next model...`);
        continue;
      }

      throw new Error(`AI Service Critical Error (${modelName}): ${error.message}`);
    }
  }

  throw new Error("All AI models failed to generate exam questions. Please check your API Key billing status.");
};