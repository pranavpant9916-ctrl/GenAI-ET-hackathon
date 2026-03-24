const { generate } = require("./gemini.service");
const { MODELS } = require("../config/gemini.config");

// 🧠 Step 1: Analyze code
async function analyzeCode(repoCode) {
    const prompt = `
You are a code reviewer.

Analyze the following code and return JSON:

Code:
${repoCode}
`;

    return generate(prompt, MODELS.FAST);
}

// 🔐 Step 2: Security check
async function securityCheck(repoCode) {
    const prompt = `
Find security vulnerabilities in this code:

Code:
${repoCode}
`;

    return generate(prompt, MODELS.PRO);
}

// 🔍 Step 3: Verification (FIXED)
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

// 🚀 Main pipeline
exports.runAnalysisPipeline = async (repoCode) => {
    try {
        if (!repoCode || repoCode.trim() === "") {
            throw new Error("❌ No code provided to pipeline");
        }

        // ⚡ Parallel execution (performance boost)
        const [analysis, security] = await Promise.all([
            analyzeCode(repoCode),
            securityCheck(repoCode)
        ]);

        const combined = {
            analysis: analysis.data,
            security: security.data
        };

        // 🧠 Final verification
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