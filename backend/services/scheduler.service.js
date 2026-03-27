const cron = require('node-cron');
const { runMultiAgentPipeline } = require('./agents.service');
const { autoFixIssues } = require('./autofix.service');
const { autoCommit, autoPush } = require('./git.service');
const { addLog } = require('./audit.service');
const { getTasks, updateTaskStatus } = require('./taskStore.service');

// Store scheduled jobs
const scheduledJobs = [];

/**
 * Schedule automated analysis on monitored repositories
 * Runs every hour by default
 */
const scheduleRepositoryMonitoring = (repos = [], cronExpression = '0 * * * *') => {
    try {
        // repos should be array of repo URLs
        const job = cron.schedule(cronExpression, async () => {
            addLog({ action: 'SCHEDULED_MONITORING_STARTED' });
            console.log('Running scheduled repository monitoring...');
            
            for (const repo of repos) {
                try {
                    console.log(`Analyzing repository: ${repo}`);
                    const result = await runMultiAgentPipeline(repo);
                    addLog({ 
                        action: 'SCHEDULED_ANALYSIS_COMPLETED', 
                        repo,
                        tasksFound: result.length 
                    });
                } catch (err) {
                    addLog({ 
                        action: 'SCHEDULED_ANALYSIS_FAILED', 
                        repo,
                        error: err.message 
                    });
                    console.error(`Analysis failed for ${repo}:`, err);
                }
            }
            
            addLog({ action: 'SCHEDULED_MONITORING_COMPLETED' });
        });
        
        scheduledJobs.push({ name: 'REPO_MONITORING', job, repos });
        console.log(`Scheduled repository monitoring every ${cronExpression}`);
        
        return { success: true, job, expression: cronExpression };
    } catch (err) {
        addLog({ action: 'SCHEDULING_FAILED', error: err.message });
        console.error('Scheduling failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Schedule automatic fix application
 * Runs every 30 minutes by default
 */
const scheduleAutoFix = (repoPath, cronExpression = '*/30 * * * *') => {
    try {
        const job = cron.schedule(cronExpression, async () => {
            addLog({ action: 'SCHEDULED_AUTOFIX_STARTED', repoPath });
            console.log('Running scheduled auto-fix...');
            
            try {
                // Get pending tasks
                const allTasks = getTasks();
                const pendingTasks = allTasks.filter(t => t.status === 'PENDING');
                
                if (pendingTasks.length === 0) {
                    addLog({ action: 'NO_PENDING_TASKS' });
                    return;
                }
                
                console.log(`Found ${pendingTasks.length} pending tasks`);
                
                // Apply fixes
                const results = await autoFixIssues(pendingTasks, repoPath);
                const fixedCount = results.filter(r => r.fixed).length;
                
                // Update task statuses
                results.forEach(result => {
                    if (result.fixed) {
                        updateTaskStatus(result.id, 'FIXED');
                    }
                });
                
                addLog({ 
                    action: 'SCHEDULED_AUTOFIX_COMPLETED',
                    tasksProcessed: pendingTasks.length,
                    tasksFixed: fixedCount
                });
                
                console.log(`Auto-fix completed: ${fixedCount}/${pendingTasks.length} tasks fixed`);
                
            } catch (err) {
                addLog({ action: 'SCHEDULED_AUTOFIX_ERROR', error: err.message });
                console.error('Auto-fix error:', err);
            }
        });
        
        scheduledJobs.push({ name: 'AUTOFIX', job, repoPath });
        console.log(`Scheduled auto-fix every ${cronExpression}`);
        
        return { success: true, job, expression: cronExpression };
    } catch (err) {
        addLog({ action: 'AUTOFIX_SCHEDULING_FAILED', error: err.message });
        console.error('Auto-fix scheduling failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Schedule automatic commit and push
 * Runs every hour by default
 */
const scheduleAutoCommitAndPush = (repoPath, cronExpression = '0 * * * *') => {
    try {
        const job = cron.schedule(cronExpression, async () => {
            addLog({ action: 'SCHEDULED_COMMIT_PUSH_STARTED', repoPath });
            console.log('Running scheduled commit and push...');
            
            try {
                // Get fixed tasks
                const allTasks = getTasks();
                const fixedTasks = allTasks.filter(t => t.status === 'FIXED');
                
                if (fixedTasks.length === 0) {
                    addLog({ action: 'NO_FIXED_TASKS_TO_COMMIT' });
                    return;
                }
                
                const message = `[AutoFix] Applied ${fixedTasks.length} automatic fixes\n\nFixed issues:\n${
                    fixedTasks.map(t => `- ${t.title}`).join('\n')
                }`;
                
                // Commit
                const commitResult = await autoCommit(repoPath, message);
                if (!commitResult.success) {
                    addLog({ action: 'SCHEDULED_COMMIT_FAILED', error: commitResult.error });
                    return;
                }
                
                // Push
                const pushResult = await autoPush(repoPath);
                if (!pushResult.success) {
                    addLog({ action: 'SCHEDULED_PUSH_FAILED', error: pushResult.error });
                    return;
                }
                
                // Mark tasks as committed
                fixedTasks.forEach(task => {
                    updateTaskStatus(task.id, 'COMMITTED');
                });
                
                addLog({ 
                    action: 'SCHEDULED_COMMIT_PUSH_COMPLETED',
                    commitHash: commitResult.hash,
                    tasksCommitted: fixedTasks.length
                });
                
                console.log(`Committed and pushed ${fixedTasks.length} fixes`);
                
            } catch (err) {
                addLog({ action: 'SCHEDULED_COMMIT_PUSH_ERROR', error: err.message });
                console.error('Commit/push error:', err);
            }
        });
        
        scheduledJobs.push({ name: 'COMMIT_PUSH', job, repoPath });
        console.log(`Scheduled auto-commit/push every ${cronExpression}`);
        
        return { success: true, job, expression: cronExpression };
    } catch (err) {
        addLog({ action: 'COMMIT_PUSH_SCHEDULING_FAILED', error: err.message });
        console.error('Commit/push scheduling failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get all scheduled jobs
 */
const getScheduledJobs = () => {
    return scheduledJobs.map(({ name, repoPath, repos, job }) => ({
        name,
        repoPath,
        repos,
        status: job._destroyed ? 'STOPPED' : 'RUNNING'
    }));
};

/**
 * Stop a scheduled job
 */
const stopScheduledJob = (jobName) => {
    try {
        const jobIndex = scheduledJobs.findIndex(j => j.name === jobName);
        
        if (jobIndex === -1) {
            return { success: false, error: 'Job not found' };
        }
        
        const jobRecord = scheduledJobs[jobIndex];
        jobRecord.job.stop();
        
        addLog({ action: 'SCHEDULED_JOB_STOPPED', jobName });
        console.log(`Stopped scheduled job: ${jobName}`);
        
        return { success: true, message: `Job ${jobName} stopped` };
    } catch (err) {
        addLog({ action: 'STOP_JOB_FAILED', error: err.message });
        console.error('Stop job failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Stop all scheduled jobs
 */
const stopAllJobs = () => {
    try {
        for (const jobRecord of scheduledJobs) {
            jobRecord.job.stop();
            addLog({ action: 'SCHEDULED_JOB_STOPPED', jobName: jobRecord.name });
        }
        
        console.log('All scheduled jobs stopped');
        return { success: true, message: 'All jobs stopped' };
    } catch (err) {
        addLog({ action: 'STOP_ALL_JOBS_FAILED', error: err.message });
        console.error('Stop all jobs failed:', err);
        return { success: false, error: err.message };
    }
};

module.exports = {
    scheduleRepositoryMonitoring,
    scheduleAutoFix,
    scheduleAutoCommitAndPush,
    getScheduledJobs,
    stopScheduledJob,
    stopAllJobs
};
