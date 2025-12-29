const https = require('https');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Querying Google for available models");

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const response = JSON.parse(data);
        
        if (response.error) {
            console.error("\nAPI Error:");
            console.error(`Code: ${response.error.code}`);
            console.error(`Message: ${response.error.message}`);
            return;
        }

        if (!response.models) {
            console.log("\nNo models found. Ensure 'Generative Language API' is enabled in Google Cloud Console.");
            return;
        }

        console.log("\nAVAILABLE MODELS FOR YOUR KEY:");
        console.log("-----------------------------------");
        response.models.forEach(model => {
            if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`Model Name: ${model.name.replace("models/", "")}`);
                console.log(`Description: ${model.description.substring(0, 50)}...`);
                console.log("-----------------------------------");
            }
        });
        
        console.log("\n INSTRUCTION: Copy one of the 'Model Names' above (e.g., 'gemini-1.0-pro') into your src/utils/aiService.js file.");
    });

}).on("error", (err) => {
    console.error("Error: " + err.message);
});