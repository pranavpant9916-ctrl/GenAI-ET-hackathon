const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { runAnalysisPipeline } = require("../services/orchestrator.services");
const { addTasks, updateTaskStatus } = require("../services/taskStore.service");
const {
    uploadFile,     // unified file upload handler
    uploadCode,
    uploadRepoUrl,
} = require("../controllers/update.controller");

// Multer setup with memory storage to keep files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // limit file size to 10MB
});

// Routes
router.post("/files", upload.single("file"), async (req, res) => {
    try {
        const fileContent = req.file.buffer.toString("utf-8");
        const filename = req.file.originalname;
        const taskId = uuidv4();

        // Create task to track in monitor
        const task = {
            id: taskId,
            title: `Analyze ${filename}`,
            file: filename,
            type: "CODE_ANALYSIS",
            status: "PENDING",
            priority: "MEDIUM",
            createdAt: new Date(),
            progress: 0
        };

        addTasks([task]);

        // Update status to IN_PROGRESS
        updateTaskStatus(taskId, "IN_PROGRESS");

        const result = await runAnalysisPipeline(fileContent, filename);

        // Update status based on analysis result
        const finalStatus = result.success ? "COMPLETED" : "FAILED";
        updateTaskStatus(taskId, finalStatus);

        res.json({
            ...result,
            taskId: taskId
        });

    } catch (err) {
        console.error("Upload analysis error:", err.message);
        res.status(500).json({
            success: false,
            error: "Analysis failed",
            message: err.message
        });
    }
}); // Accepts any file
router.post("/code", uploadCode);                        // Raw code input
router.post("/url", uploadRepoUrl);                     // GitHub repo URL

module.exports = router;