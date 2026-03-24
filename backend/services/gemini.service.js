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
            ],
            generationConfig: {
                maxOutputTokens: 2000
            }
        },
        {
            params: {
                key: process.env.API_KEY1
            },
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 40000
        }
    );
}

exports.generate = async (prompt, preferredModel = MODELS.FAST) => {
    const modelsToTry = [preferredModel, MODELS.FALLBACK];

    for (let model of modelsToTry) {
        try {
            console.time(`Gemini-${model}`);
            const res = await callGemini(model, prompt);
            console.timeEnd(`Gemini-${model}`);

            return {
                modelUsed: model,
                data: res.data
            };

        } catch (err) {
            const isTimeout = err.code === "ECONNABORTED";
            const isNetworkError = !err.response;

            console.error(`❌ Model failed: ${model}`, {
                status: err.response?.status,
                message: err.message,
                isNetworkError,
                isTimeout
            });

            if (!isTimeout && !isNetworkError && err.response?.status !== 404) {
                throw err;
            }

            console.log(`🔁 Retrying with next model...`);
        }
    }

    throw new Error("All Gemini models failed");
};