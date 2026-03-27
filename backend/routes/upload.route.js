const express = require("express");
const router = express.Router();
const multer = require("multer");
const { runAnalysisPipeline } = require("../services/orchestrator.services");
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

        const result = await runAnalysisPipeline(fileContent, filename);

        res.json(result);

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