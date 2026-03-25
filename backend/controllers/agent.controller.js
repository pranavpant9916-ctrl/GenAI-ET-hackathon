const { runMultiAgentPipeline } = require("../services/agents.service");

exports.runAgents = async (req, res) => {
    try {
        const { repoUrl } = req.body;

        const result = await runMultiAgentPipeline(repoUrl);

        res.json({
            success: true,
            tasks: result
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Agent pipeline failed" });
    }
};