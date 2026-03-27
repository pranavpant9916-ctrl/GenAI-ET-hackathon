const simpleGit = require('simple-git');
const { Octokit } = require('@octokit/rest');
const { addLog } = require('./audit.service');

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Auto-commit changes to repository
 */
const autoCommit = async (repoPath, message) => {
    try {
        const git = simpleGit(repoPath);
        
        // Stage all changes
        await git.add('.');
        
        // Check if there are changes to commit
        const status = await git.status();
        if (status.files.length === 0) {
            addLog({ action: 'AUTO_COMMIT_SKIPPED', reason: 'No changes detected' });
            return { success: false, message: 'No changes to commit' };
        }
        
        // Commit
        const result = await git.commit(message);
        
        addLog({ action: 'AUTO_COMMIT_SUCCESS', message, hash: result.commit });
        return { success: true, hash: result.commit };
    } catch (err) {
        addLog({ action: 'AUTO_COMMIT_FAILED', error: err.message });
        console.error('Auto commit failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Auto-push changes to remote repository
 */
const autoPush = async (repoPath, branch = 'main') => {
    try {
        const git = simpleGit(repoPath);
        
        await git.push('origin', branch);
        
        addLog({ action: 'AUTO_PUSH_SUCCESS', branch });
        return { success: true, branch };
    } catch (err) {
        addLog({ action: 'AUTO_PUSH_FAILED', error: err.message });
        console.error('Auto push failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Create a pull request with fixes
 */
const createPullRequest = async (owner, repo, title, body, head, base = 'main') => {
    try {
        if (!process.env.GITHUB_TOKEN) {
            addLog({ action: 'PR_CREATION_SKIPPED', reason: 'GITHUB_TOKEN not set' });
            return { success: false, message: 'GitHub token not configured' };
        }

        const response = await octokit.pulls.create({
            owner,
            repo,
            title,
            body,
            head,
            base
        });

        addLog({ action: 'PR_CREATED_SUCCESS', pr_number: response.data.number });
        return { success: true, pr: response.data };
    } catch (err) {
        addLog({ action: 'PR_CREATION_FAILED', error: err.message });
        console.error('PR creation failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Create a new branch locally
 */
const createBranch = async (repoPath, branchName) => {
    try {
        const git = simpleGit(repoPath);
        
        // Fetch latest changes
        await git.fetch();
        
        // Create and checkout branch
        await git.checkoutLocalBranch(branchName);
        
        addLog({ action: 'BRANCH_CREATED', branchName });
        return { success: true, branchName };
    } catch (err) {
        addLog({ action: 'BRANCH_CREATION_FAILED', error: err.message });
        console.error('Branch creation failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Clone repository
 */
const cloneRepository = async (repoUrl, targetPath) => {
    try {
        const git = simpleGit();
        
        await git.clone(repoUrl, targetPath);
        
        addLog({ action: 'REPO_CLONED', repoUrl, path: targetPath });
        return { success: true, path: targetPath };
    } catch (err) {
        addLog({ action: 'CLONE_FAILED', error: err.message });
        console.error('Clone failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get Git status and diff
 */
const getStatus = async (repoPath) => {
    try {
        const git = simpleGit(repoPath);
        const status = await git.status();
        return { success: true, status };
    } catch (err) {
        console.error('Status check failed:', err);
        return { success: false, error: err.message };
    }
};

module.exports = {
    autoCommit,
    autoPush,
    createPullRequest,
    createBranch,
    cloneRepository,
    getStatus
};
