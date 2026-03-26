const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    uploadFile,     // unified file upload handler
    uploadCode,
    uploadRepoUrl,
} = require("../controllers/update.controller");

// Multer setup to accept any file type
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 10 * 1024 * 1024 }, // optional: limit file size to 10MB
});

// Routes
router.post("/file", upload.single("file"), uploadFile); // Accepts any file
router.post("/code", uploadCode);                        // Raw code input
router.post("/url", uploadRepoUrl);                     // GitHub repo URL

module.exports = router;