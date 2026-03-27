# Autonomous Agent System - Configuration & Usage Guide

## Overview
Your GenAI agent system is now **fully autonomous** with zero human intervention. It can automatically:
- ✅ Analyze code via webhooks
- ✅ Detect and fix issues
- ✅ Run scheduled jobs
- ✅ Commit and push fixes
- ✅ Self-verify and validate

## Quick Setup

### 1. Environment Variables
Add these to your `.env` file:

```env
# GitHub Integration (Optional but recommended)
GITHUB_TOKEN=ghp_your_token_here
WEBHOOK_SECRET=your_webhook_secret

# Server
PORT=5000

# Gemini API
GEMINI_API_KEY=your_gemini_key
```

### 2. GitHub Webhook Setup (Auto-Trigger)

On your GitHub repository:
1. Go to **Settings → Webhooks**
2. Click **Add webhook**
3. Set:
   - **Payload URL**: `https://your-domain.com/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: Same as `WEBHOOK_SECRET` in `.env`
4. Select events: `Push`, `Pull requests`, `Releases`
5. Click **Add webhook**

Now every code push automatically triggers analysis and fixes!

## API Endpoints

### Webhooks (Auto-Trigger)
```bash
# Test webhook (manual trigger)
POST /webhooks/test

# GitHub webhook (auto from GitHub)
POST /webhooks/github

# Generic webhook (other platforms)
POST /webhooks/
```

### Scheduler (Background Jobs)
```bash
# Start monitoring repositories every hour
POST /scheduler/monitor/start
Body: {
  "repos": ["https://github.com/user/repo1", "https://github.com/user/repo2"],
  "cronExpression": "0 * * * *"  // Optional, defaults to hourly
}

# Start auto-fix every 30 minutes
POST /scheduler/autofix/start
Body: {
  "repoPath": "/path/to/repo",
  "cronExpression": "*/30 * * * *"
}

# Start auto-commit/push every hour
POST /scheduler/commit/start
Body: {
  "repoPath": "/path/to/repo",
  "cronExpression": "0 * * * *"
}

# Get all scheduled jobs
GET /scheduler/jobs

# Stop a job
POST /scheduler/jobs/{jobName}/stop

# Stop all jobs
POST /scheduler/jobs/stop-all
```

### Health & Status
```bash
# Check system status
GET /health

# Get task statistics
GET /tasks

# Monitor workflow
GET /monitor
```

## Usage Examples

### Example 1: Enable Auto-Analysis on Every Push
```bash
# Already done via GitHub Webhooks!
# Just push code and it automatically analyzes
```

### Example 2: Schedule Hourly Monitoring
```bash
curl -X POST http://localhost:5000/scheduler/monitor/start \
  -H "Content-Type: application/json" \
  -d '{
    "repos": [
      "https://github.com/your-user/your-repo"
    ],
    "cronExpression": "0 * * * *"
  }'
```

### Example 3: Enable Auto-Fixes
```bash
curl -X POST http://localhost:5000/scheduler/autofix/start \
  -H "Content-Type: application/json" \
  -d '{
    "repoPath": "/home/user/projects/your-repo",
    "cronExpression": "*/30 * * * *"
  }'
```

### Example 4: Auto-Commit Fixed Code
```bash
curl -X POST http://localhost:5000/scheduler/commit/start \
  -H "Content-Type: application/json" \
  -d '{
    "repoPath": "/home/user/projects/your-repo",
    "cronExpression": "0 * * * *"
  }'
```

## Cron Expression Guide

Common patterns:

| Pattern | Meaning |
|---------|---------|
| `0 * * * *` | Every hour |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 * * *` | Daily at midnight |
| `0 0 * * 1` | Weekly on Monday |
| `0 0 1 * *` | Monthly on 1st |
| `0 9-17 * * *` | Every hour 9 AM - 5 PM |

[Full cron syntax guide](https://crontab.guru/)

## How It Works Autonomously

### 1. **Webhook Flow**
```
Code Push → GitHub Webhook → Agent System
    ↓
    Retriever Agent (fetch files)
    ↓
    Analyzer Agent (find issues)
    ↓
    Decision Agent (prioritize)
    ↓
    Execution Agent (apply fixes) ← NEW!
    ↓
    Autonomous Loop (verify & validate)
    ↓
    Git Service (auto-commit & push)
```

### 2. **Scheduled Flow**
```
Cron Timer → Scheduler
    ↓
    Monitor Repos → Analyze → Get Tasks
    ↓
    AutoFix Service → Apply Fixes to Files
    ↓
    Verify Service → Validate Fixes
    ↓
    Git Service → Commit & Push → Auto-PR (Optional)
```

### 3. **Supported Fix Types**

| Issue Type | How It's Fixed |
|-----------|----------------|
| `console.log` | Automatically removed |
| `TODO/FIXME` | AI generates fix |
| Code smells | AI analyzes & fixes |
| Best practices | AI refactors code |

## Task Lifecycle

```
PENDING → IN_PROGRESS → FIXED → VERIFIED → COMMITTED
                      ↓
                   FAILED (if error)
```

## Monitoring & Logging

All autonomous actions are logged. Check logs via:
```bash
# View all logs (audit trail)
GET /audit

# Monitor current workflow
GET /monitor

# Check job status
GET /scheduler/jobs
```

## Configuration
### Task Store (In-Memory)
Tasks are stored in memory. For persistent storage, replace with MongoDB/PostgreSQL:
```javascript
// services/taskStore.service.js
// Replace array with database calls
```

### Fix Strategy
Customize how fixes are applied:
```javascript
// services/autofix.service.js
// Modify generateFix() for different AI prompts
// Modify applyLineRangeFix() for different fix strategies
```

## Security Notes

⚠️ **Important Security Practices:**

1. **GitHub Token**: Never commit `.env` to git
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Webhook Secret**: Always verify signatures
   ```javascript
   // Already implemented in webhook.service.js
   verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)
   ```

3. **Rate Limiting**: Add to production
   ```bash
   npm install express-rate-limit
   ```

4. **Branch Protection**: Set up on GitHub
   - Require PR reviews before merge
   - Require status checks to pass
   - Dismiss stale PR approvals

## Troubleshooting

### Issue: Webhooks not triggering
**Solution:**
- Check GitHub repository settings → Webhooks
- Verify payload URL is accessible
- Check server logs for errors
- Use `/webhooks/test` to manually test

### Issue: Fixes not being applied
**Solution:**
- Check `GITHUB_TOKEN` is set
- Verify repo path exists locally
- Check logs: `GET /tasks`
- Ensure write permissions on repo

### Issue: Git commands failing
**Solution:**
- Ensure git is installed: `which git`
- Check repo has proper git config
- Verify branch exists
- Check folder permissions

### Issue: Tasks stuck in PENDING
**Solution:**
- Check auto-fix scheduler is running
- Verify repo path is correct
- Check log file for errors
- Restart server if needed

## Advanced Configuration

### Custom Fix Generator
Edit `services/autofix.service.js`:
```javascript
const generateFix = async (fileContent, issue, filename) => {
    // Change the prompt to customize fix behavior
    const prompt = `Your custom prompt here...`;
    
    return await generate(prompt, MODELS.FAST);
};
```

### Custom Webhooks
Add platform-specific handlers in `services/webhook.service.js`:
```javascript
const handleGitlabEvent = async (payload) => {
    // GitLab webhook handling
};
```

### Database Integration
Replace in-memory task store with real DB:
```javascript
// taskStore.service.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: String,
    title: String,
    status: String,
    // ... other fields
});

exports.getTasks = async () => {
    return await Task.find();
};
```

## What's Included

✅ **Services**
- ✅ agents.service.js - Core multi-agent pipeline
- ✅ autofix.service.js - Autonomous fix application
- ✅ git.service.js - Git operations (commit, push)
- ✅ webhook.service.js - GitHub event handling
- ✅ scheduler.service.js - Background job scheduling
- ✅ analyzer.service.js - Code analysis
- ✅ orchestrator.services.js - Analysis pipeline
- ✅ audit.service.js - Logging & audit trail

✅ **Controllers**
- ✅ webhook.controller.js - Webhook request handling
- ✅ scheduler.controller.js - Job management
- ✅ agent.controller.js - Agent execution
- ✅ analyze.controller.js - Analysis requests

✅ **Routes**
- ✅ webhook.route.js - Webhook endpoints
- ✅ scheduler.route.js - Scheduler endpoints

## Next Steps

1. **Set GITHUB_TOKEN** for auto-commits
2. **Configure GitHub Webhooks** for auto-trigger
3. **Start scheduler** for background monitoring
4. **Monitor logs** to verify autonomy

Your system is now **fully autonomous**! 🚀

---

**Questions?** Check `backend/services/` for implementation details.