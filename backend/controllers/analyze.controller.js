const { v4: uuidv4 } = require("uuid");
const { runAnalysisPipeline } = require("../services/orchestrator.services");
const { addTasks, updateTaskStatus } = require("../services/taskStore.service");

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

        const taskId = uuidv4();

        // Create task to track
        const task = {
            id: taskId,
            title: "Analyze direct code input",
            type: "CODE_ANALYSIS",
            status: "PENDING",
            priority: "MEDIUM",
            createdAt: new Date(),
            progress: 0
        };

        addTasks([task]);
        updateTaskStatus(taskId, "IN_PROGRESS");

        const result = await runAnalysisPipeline(code, "direct-input");

        const finalStatus = result.success ? "COMPLETED" : "FAILED";
        updateTaskStatus(taskId, finalStatus);

        res.json({
            ...result,
            taskId: taskId
        });

    } catch (err) {
        console.error("Controller Error:", err.message);

        res.status(500).json({
            success: false,
            error: "Server Error",
            message: "Code analysis failed. Please try again."
        });
    }
};