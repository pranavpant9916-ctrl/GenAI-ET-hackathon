const express = require("express");
const router = express.Router();
const { handleGithubWebhook, handleGenericWebhook, testWebhook } = require("../controllers/webhook.controller");

// Test endpoint
router.get("/test", testWebhook);

// GitHub webhook endpoint
router.post("/github", handleGithubWebhook);

// Generic webhook endpoint
router.post("/", handleGenericWebhook);

module.exports = router;
