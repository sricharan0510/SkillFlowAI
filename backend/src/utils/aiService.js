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