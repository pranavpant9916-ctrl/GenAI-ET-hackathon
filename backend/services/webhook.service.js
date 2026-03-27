const crypto = require('crypto');
const { addLog } = require('./audit.service');
const { runMultiAgentPipeline } = require('./agents.service');
const { cloneRepository } = require('./git.service');
const path = require('path');
const fs = require('fs');

/**
 * Verify GitHub webhook signature
 */
const verifyWebhookSignature = (payload, signature, secret) => {
    if (!secret) {
        console.warn('WEBHOOK_SECRET not configured - skipping signature verification');
        return true;
    }
    
    const hash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    const expectedSignature = `sha256=${hash}`;
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

/**
 * Handle GitHub push event
 */
const handlePushEvent = async (payload) => {
    try {
        const { repository, ref } = payload;
        const repoUrl = repository.clone_url;
        const branch = ref.split('/').pop();
        
        addLog({ 
            action: 'WEBHOOK_PUSH_RECEIVED', 
            repo: repository.name, 
            branch 
        });
        
        // Trigger analysis pipeline
        const result = await runMultiAgentPipeline(repoUrl);
        
        addLog({ 
            action: 'WEBHOOK_ANALYSIS_TRIGGERED', 
            repo: repository.name,
            tasksFound: result.length 
        });
        
        return {
            success: true,
            message: 'Push event processed',
            tasksFound: result.length,
            repository: repository.name
        };
    } catch (err) {
        addLog({ action: 'WEBHOOK_PUSH_ERROR', error: err.message });
        console.error('Push event handling failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Handle GitHub pull request event
 */
const handlePullRequestEvent = async (payload) => {
    try {
        const { action, pull_request, repository } = payload;
        
        addLog({ 
            action: 'WEBHOOK_PR_RECEIVED', 
            pr_number: pull_request.number,
            pr_action: action
        });
        
        if (action === 'opened' || action === 'synchronize') {
            // Trigger analysis on new/updated PRs
            const result = await runMultiAgentPipeline(repository.clone_url);
            
            addLog({ 
                action: 'WEBHOOK_PR_ANALYSIS_TRIGGERED',
                pr_number: pull_request.number,
                tasksFound: result.length
            });
            
            return {
                success: true,
                message: 'PR analyzed',
                tasksFound: result.length,
                pr_number: pull_request.number
            };
        }
        
        return { success: true, message: 'PR event processed', action };
    } catch (err) {
        addLog({ action: 'WEBHOOK_PR_ERROR', error: err.message });
        console.error('PR event handling failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Handle release event - trigger on new releases
 */
const handleReleaseEvent = async (payload) => {
    try {
        const { action, release, repository } = payload;
        
        addLog({ 
            action: 'WEBHOOK_RELEASE_RECEIVED',
            release_name: release.name,
            release_action: action
        });
        
        if (action === 'published') {
            // Trigger full analysis on release
            const result = await runMultiAgentPipeline(repository.clone_url);
            
            addLog({ 
                action: 'WEBHOOK_RELEASE_ANALYSIS_TRIGGERED',
                release: release.name,
                tasksFound: result.length
            });
            
            return {
                success: true,
                message: 'Release analyzed',
                tasksFound: result.length,
                release: release.name
            };
        }
        
        return { success: true, message: 'Release event processed', action };
    } catch (err) {
        addLog({ action: 'WEBHOOK_RELEASE_ERROR', error: err.message });
        console.error('Release event handling failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Route webhook to appropriate handler based on event type
 */
const handleWebhook = async (eventType, payload, signature = null) => {
    try {
        // Verify signature if present
        if (signature) {
            try {
                const payloadString = JSON.stringify(payload);
                const isValid = verifyWebhookSignature(
                    payloadString, 
                    signature, 
                    process.env.WEBHOOK_SECRET
                );
                
                if (!isValid) {
                    addLog({ action: 'WEBHOOK_INVALID_SIGNATURE' });
                    return { success: false, error: 'Invalid webhook signature' };
                }
            } catch (err) {
                console.warn('Signature verification error:', err.message);
                // Continue processing anyway
            }
        }
        
        let result;
        
        switch (eventType) {
            case 'push':
                result = await handlePushEvent(payload);
                break;
            case 'pull_request':
                result = await handlePullRequestEvent(payload);
                break;
            case 'release':
                result = await handleReleaseEvent(payload);
                break;
            default:
                addLog({ action: 'WEBHOOK_UNKNOWN_EVENT', eventType });
                result = { success: true, message: 'Event type not processed', eventType };
        }
        
        return result;
    } catch (err) {
        addLog({ action: 'WEBHOOK_PROCESSING_ERROR', error: err.message });
        console.error('Webhook processing failed:', err);
        return { success: false, error: err.message };
    }
};

module.exports = {
    verifyWebhookSignature,
    handleWebhook,
    handlePushEvent,
    handlePullRequestEvent,
    handleReleaseEvent
};
