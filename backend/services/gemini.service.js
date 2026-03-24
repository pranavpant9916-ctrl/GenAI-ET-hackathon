const axios = require("axios");
const { GEMINI_BASE_URL, MODELS } = require("../config/gemini.config");

async function callGemini(model, prompt) {
    return axios.post(
        `${GEMINI_BASE_URL}/models/${model}:generateContent`,
        {
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        },
        {
            params: {
                key: process.env.API_KEY1
            },
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 10000
        }
    );
}

// 🔥 Main function with fallback
exports.generate = async (prompt, preferredModel = MODELS.FAST) => {
    const modelsToTry = [preferredModel, MODELS.FALLBACK];

    for (let model of modelsToTry) {
        try {
            const res = await callGemini(model, prompt);

            return {
                modelUsed: model,
                data: res.data
            };

        } catch (err) {
            console.error(`❌ Model failed: ${model}`, {
                status: err.response?.status,
                message: err.message
            });

            // Only retry on 404 (model issue)
            if (err.response?.status !== 404) {
                throw err;
            }
        }
    }

    throw new Error("All Gemini models failed");
};