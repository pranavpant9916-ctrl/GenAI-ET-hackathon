const { v4: uuidv4 } = require("uuid");

// Upload ZIP file
exports.uploadZip = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: "No ZIP file uploaded" });

        const repoId = uuidv4();
        res.json({ success: true, repoId, originalName: file.originalname, path: file.path });
    } catch (err) {
        res.status(500).json({ success: false, error: "ZIP upload failed" });
    }
};

// Upload raw code
exports.uploadCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: "Code is required" });

        const repoId = uuidv4();
        res.json({ success: true, repoId });
    } catch (err) {
        res.status(500).json({ success: false, error: "Code upload failed" });
    }
};

// Upload repo URL
exports.uploadRepoUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: "Repo URL is required" });

        const repoId = uuidv4();
        res.json({ success: true, repoId });
    } catch (err) {
        res.status(500).json({ success: false, error: "Repo URL upload failed" });
    }
};

// Generic file upload (any type)
exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const repoId = uuidv4();
        res.json({
            success: true,
            repoId,
            originalName: file.originalname,
            path: file.path
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "File upload failed" });
    }
};