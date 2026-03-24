const { generate } = require("./gemini.service");
const { MODELS } = require("../config/gemini.config");

async function analyzeCode(repoCode) {
    const prompt = `
You are a code reviewer.

Analyze the following code and return JSON while following given rules:
    - Summary should be concise and short.
    - Easy to understand language for beginners.
    - Consider code to be used high level organisations and thus expected to be professional.

Code:
${repoCode}
`;

    return generate(prompt, MODELS.FAST);
}

async function securityCheck(repoCode) {
    const prompt = `
Find security vulnerabilities in this code:

Code:
${repoCode}
`;

    return generate(prompt, MODELS.PRO);
}

async function verify(repoCode, previousOutput) {
    const prompt = `
Verify and correct this analysis.

Code:
${repoCode}

Previous Analysis:
${JSON.stringify(previousOutput)}

Return corrected JSON only.
`;

    return generate(prompt, MODELS.PRO);
}

exports.runAnalysisPipeline = async (repoCode) => {
    try {
        if (!repoCode || repoCode.trim() === "") {
            throw new Error("❌ No code provided to pipeline");
        }

        const [analysis, security] = await Promise.all([
            analyzeCode(repoCode),
            securityCheck(repoCode)
        ]);

        const combined = {
            analysis: analysis.data,
            security: security.data
        };

        const verified = await verify(repoCode, combined);

        return {
            success: true,
            result: verified.data
        };

    } catch (err) {
        console.error("❌ Pipeline Error:", err.message);

        return {
            success: false,
            error: err.message
        };
    }
};