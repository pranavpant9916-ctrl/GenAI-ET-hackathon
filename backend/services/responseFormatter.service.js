/**
 * Extracts and formats Gemini API response into user-friendly format
 */

function extractTextFromGeminiResponse(geminiResponse) {
    try {
        // Handle the nested Gemini response structure
        if (geminiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return geminiResponse.data.candidates[0].content.parts[0].text;
        }
        // Fallback for different response structures
        if (typeof geminiResponse === 'string') {
            return geminiResponse;
        }
        if (geminiResponse?.text) {
            return geminiResponse.text;
        }
        return null;
    } catch (err) {
        console.error("Error extracting text:", err.message);
        return null;
    }
}

function parseAnalysisText(text) {
    try {
        // Try to parse as JSON first
        const parsed = JSON.parse(text);
        return parsed;
    } catch (e) {
        // If not JSON, return the text as is
        return { summary: text };
    }
}

function formatAnalysisResponse(geminiResponse) {
    const text = extractTextFromGeminiResponse(geminiResponse);
    
    if (!text) {
        return {
            status: "error",
            message: "Could not extract analysis from API response"
        };
    }

    const parsed = parseAnalysisText(text);

    return {
        status: "success",
        summary: parsed.summary || "Code analysis completed",
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || [],
        qualityScore: parsed.qualityScore || "N/A",
        details: parsed
    };
}

function formatSecurityResponse(geminiResponse) {
    const text = extractTextFromGeminiResponse(geminiResponse);
    
    if (!text) {
        return {
            status: "error",
            vulnerabilities: [],
            riskLevel: "unknown"
        };
    }

    const parsed = parseAnalysisText(text);

    return {
        status: "success",
        riskLevel: parsed.riskLevel || "low",
        vulnerabilities: parsed.vulnerabilities || [],
        recommendations: parsed.recommendations || [],
        details: parsed
    };
}

function formatFinalResponse(analysis, security, filename) {
    return {
        success: true,
        filename: filename,
        timestamp: new Date().toISOString(),
        analysis: {
            type: "code-quality",
            status: analysis.status || "completed",
            summary: analysis.summary,
            issues: analysis.issues,
            recommendations: analysis.recommendations,
            qualityScore: analysis.qualityScore
        },
        security: {
            type: "vulnerability-scan",
            status: security.status || "completed",
            riskLevel: security.riskLevel,
            vulnerabilities: security.vulnerabilities,
            recommendations: security.recommendations
        },
        overallStatus: {
            passed: analysis.issues.length === 0 && security.vulnerabilities.length === 0,
            issuesFound: analysis.issues.length,
            vulnerabilitiesFound: security.vulnerabilities.length,
            actionRequired: analysis.issues.length > 0 || security.vulnerabilities.length > 0
        }
    };
}

module.exports = {
    extractTextFromGeminiResponse,
    parseAnalysisText,
    formatAnalysisResponse,
    formatSecurityResponse,
    formatFinalResponse
};
