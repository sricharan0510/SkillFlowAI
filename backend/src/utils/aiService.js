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
         You are an expert academic tutor and study assistant.
         Analyze the provided text and strictly focus ONLY on the topic: "${topic}".

         Instructions:
         1. Locate sections in the text related to "${topic}".
         2. Provide a detailed explanation of this specific concept as found in the text.
         3. Extract key points, formulas, or definitions related to "${topic}".
         4. If the topic is not found in the text, politely state that.
         5. Format the output in clean Markdown (Use ## for headings, * for bullets).

         Source Text:
         "${text}"
       `;
  } else {
    prompt = `
         You are an expert academic summarizer.
         Please provide a structured summary of the provided text.

         Instructions:
         1. Create a "Key Concepts" section listing the top 5-7 core ideas.
         2. Provide a detailed summary of the content, grouped by logical chapters or themes.
         3. Highlight important definitions or conclusions.
         4. Format the output in clean Markdown (Use ## for headings, * for bullets, **bold** for key terms).

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