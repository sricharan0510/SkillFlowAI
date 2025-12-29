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
        You are an expert personal tutor. Your goal is to explain complex topics in the simplest, most "student-friendly" way possible.
        
        Analyze the provided text and focus ONLY on the topic: "${topic}".

        Instructions:
        1. **Explain Like I'm a Student:** Provide a clear, easy-to-understand explanation of "${topic}". Avoid overly dense jargon where simple words work.
        2. **Key Takeaways:** List the most important points using bullet points.
        3. **Real-World Example:** If applicable, give 1 short analogy or example to help understanding.
        4. **Formulas/Data:** Extract any specific formulas, dates, or technical specs related to this topic.
        5. **Format:** Use Markdown. Use ## for headings and * for bullets. Keep paragraphs short.

        Source Text:
        "${text}"
      `;
  } else {
    prompt = `
        You are an expert exam preparation coach.
        Convert the provided text into "Smart Notes" and "Short Notes" that are easy to study and memorize.

        Instructions:.

        SECTION : SMART NOTES (Core Concepts)
        - Group the content by key themes or chapters.
        - DO NOT use long paragraphs. Use **bullet points** for everything.
        - Bold key terms and defination headings.
        - Explain *why* a concept matters, not just what it is.

        SECTION : SHORT NOTES / CHEAT SHEET
        - Extract the "must-know" facts for an exam.
        - Create a distinct list:
          * Definitions (1-line max).
          * Important numbers (e.g., Port numbers, Dates).
          * Comparisons (e.g., TCP vs UDP).
          * Formulas.

        SECTION : MNEMONICS OR TIPS (Optional)
        - If there are hard lists to remember, suggest a mnemonic or a study tip.

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