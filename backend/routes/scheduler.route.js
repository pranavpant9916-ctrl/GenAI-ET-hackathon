const express = require("express");
const router = express.Router();
const {
    startMonitoring,
    startAutoFix,
    startAutoCommitAndPush,
    getJobs,
    stopJob,
    stopAllJobs
} = require("../controllers/scheduler.controller");

// Start monitoring
router.post("/monitor/start", startMonitoring);

// Start auto-fix
router.post("/autofix/start", startAutoFix);

// Start auto-commit and push
router.post("/commit/start", startAutoCommitAndPush);

// Get all jobs
router.get("/jobs", getJobs);

// Stop specific job
router.post("/jobs/:jobName/stop", stopJob);

// Stop all jobs
router.post("/jobs/stop-all", stopAllJobs);

module.exports = router;
