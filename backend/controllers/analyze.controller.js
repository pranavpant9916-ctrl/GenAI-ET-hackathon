const { runAnalysisPipeline } = require("../services/orchestrator.services");

exports.analyzeRepo = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Validation Error",
                message: "Code is required"
            });
        }

        if (code.length > 50000) {
            return res.status(413).json({
                success: false,
                error: "Payload Too Large",
                message: "Code exceeds maximum length (50,000 characters)"
            });
        }

        const result = await runAnalysisPipeline(code, "direct-input");

        res.json(result);

    } catch (err) {
        console.error("Controller Error:", err.message);

        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "Code analysis failed. Please try again."
        });
    }
};