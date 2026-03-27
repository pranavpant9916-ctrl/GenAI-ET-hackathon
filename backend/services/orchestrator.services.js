const { generate } = require("./gemini.service");
const { MODELS } = require("../config/gemini.config");
const { formatAnalysisResponse, formatSecurityResponse, formatFinalResponse, extractTextFromGeminiResponse } = require("./responseFormatter.service");

async function analyzeCode(repoCode) {
    const prompt = `
You are a code reviewer. Analyze the following code and provide feedback in this JSON format:
{
  "summary": "Brief overview of the code quality",
  "issues": [
    {"type": "issue name", "severity": "high|medium|low", "description": "explanation"},
  ],
  "recommendations": [
    "Actionable improvement suggestions"
  ],
  "qualityScore": "A/B/C/D"
}

Follow these rules:
- Summary should be concise (1-2 sentences)
- Use beginner-friendly language
- Assume code is for high-level organizations (professional standards)

Code:
${repoCode}
`;

    return generate(prompt, MODELS.FAST);
}

async function securityCheck(repoCode) {
    const prompt = `
You are a security expert. Scan this code for vulnerabilities and respond in this JSON format:
{
  "riskLevel": "critical|high|medium|low",
  "vulnerabilities": [
    {"type": "CVE type", "severity": "critical|high|medium|low", "description": "explanation", "fix": "how to fix"}
  ],
  "recommendations": [
    "Security best practices to implement"
  ]
}

Code:
${repoCode}
`;

    return generate(prompt, MODELS.PRO);
}

exports.runAnalysisPipeline = async (repoCode, filename = "uploaded_code") => {
    try {
        if (!repoCode || repoCode.trim() === "") {
            throw new Error("No code provided to pipeline");
        }

        const [analysisRaw, securityRaw] = await Promise.all([
            analyzeCode(repoCode),
            securityCheck(repoCode)
        ]);

        // Extract text from Gemini responses
        const analysisText = extractTextFromGeminiResponse(analysisRaw);
        const securityText = extractTextFromGeminiResponse(securityRaw);

        // Format the responses
        const analysis = formatAnalysisResponse(analysisRaw);
        const security = formatSecurityResponse(securityRaw);

        // Return professional, user-friendly response
        return formatFinalResponse(analysis, security, filename);

    } catch (err) {
        console.error("Pipeline Error:", err.message);

        return {
            success: false,
            error: err.message,
            message: "Code analysis failed. Please check backend logs."
        };
    }
};