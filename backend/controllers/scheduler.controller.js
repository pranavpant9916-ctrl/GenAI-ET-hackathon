const {
    scheduleRepositoryMonitoring,
    scheduleAutoFix,
    scheduleAutoCommitAndPush,
    getScheduledJobs,
    stopScheduledJob,
    stopAllJobs
} = require("../services/scheduler.service");

/**
 * Start repository monitoring schedule
 */
exports.startMonitoring = (req, res) => {
    try {
        const { repos, cronExpression } = req.body;

        if (!repos || !Array.isArray(repos) || repos.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "repos must be a non-empty array"
            });
        }

        const result = scheduleRepositoryMonitoring(repos, cronExpression);

        res.json({
            success: true,
            message: "Repository monitoring scheduled",
            ...result
        });

    } catch (err) {
        console.error("Start monitoring error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to schedule monitoring",
            message: err.message
        });
    }
};

/**
 * Start auto-fix schedule
 */
exports.startAutoFix = (req, res) => {
    try {
        const { repoPath, cronExpression } = req.body;

        if (!repoPath) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "repoPath is required"
            });
        }

        const result = scheduleAutoFix(repoPath, cronExpression);

        res.json({
            success: true,
            message: "Auto-fix scheduled",
            ...result
        });

    } catch (err) {
        console.error("Start auto-fix error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to schedule auto-fix",
            message: err.message
        });
    }
};

/**
 * Start auto-commit and push schedule
 */
exports.startAutoCommitAndPush = (req, res) => {
    try {
        const { repoPath, cronExpression } = req.body;

        if (!repoPath) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "repoPath is required"
            });
        }

        const result = scheduleAutoCommitAndPush(repoPath, cronExpression);

        res.json({
            success: true,
            message: "Auto-commit and push scheduled",
            ...result
        });

    } catch (err) {
        console.error("Start auto-commit error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to schedule auto-commit",
            message: err.message
        });
    }
};

/**
 * Get all scheduled jobs
 */
exports.getJobs = (req, res) => {
    try {
        const jobs = getScheduledJobs();

        res.json({
            success: true,
            jobs,
            count: jobs.length
        });

    } catch (err) {
        console.error("Get jobs error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve jobs",
            message: err.message
        });
    }
};

/**
 * Stop a specific scheduled job
 */
exports.stopJob = (req, res) => {
    try {
        const { jobName } = req.params;

        if (!jobName) {
            return res.status(400).json({
                success: false,
                error: "Invalid input",
                message: "jobName is required"
            });
        }

        const result = stopScheduledJob(jobName);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);

    } catch (err) {
        console.error("Stop job error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to stop job",
            message: err.message
        });
    }
};

/**
 * Stop all scheduled jobs
 */
exports.stopAllJobs = (req, res) => {
    try {
        const result = stopAllJobs();

        res.json(result);

    } catch (err) {
        console.error("Stop all jobs error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to stop all jobs",
            message: err.message
        });
    }
};
