const { runAnalysisPipeline } = require("../services/orchestrator.services");

exports.analyzeRepo = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Code is required"
            });
        }

        const result = await runAnalysisPipeline(code);

        res.json(result);

    } catch (err) {
        console.error("Controller Error:", err.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};