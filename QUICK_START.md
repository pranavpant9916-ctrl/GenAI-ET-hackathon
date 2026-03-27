# 🚀 Autonomous MultiModel Agent System - Quick Start

### New Features Added:

1. **🔗 Webhook Integration** - Auto-trigger on code push
   - GitHub webhook support (`/webhooks/github`)
   - Generic webhook support (`/webhooks/`)
   - Signature verification for security

2. **🤖 Autonomous Fix Application** - Automatically fixes detected issues
   - Removes console.log statements
   - AI-powered code fixes
   - File modification and verification

3. **⏰ Background Job Scheduling** - Runs without human intervention
   - Repository monitoring (configurable frequency)
   - Auto-fix execution (default: every 30 minutes)
   - Auto-commit and push (default: hourly)

4. **🔄 Git Integration** - Automatic commits and pushes
   - Auto-commit fixed code
   - Auto-push to repository
   - PR creation support (optional)

5. **✨ Self-Healing Loop** - Autonomous verification
   - Runs verification on fixed code
   - Updates task status automatically
   - Reports results in logs

## 📋 Files Created/Modified

### New Services (backend/services/)
```
✅ git.service.js          - Git operations
✅ autofix.service.js      - Autonomous fix application
✅ webhook.service.js      - Webhook handling
✅ scheduler.service.js    - Background job scheduling
```

### New Controllers (backend/controllers/)
```
✅ webhook.controller.js   - Webhook request routing
✅ scheduler.controller.js - Job management endpoints
```

### New Routes (backend/routes/)
```
✅ webhook.route.js        - /webhooks endpoints
✅ scheduler.route.js      - /scheduler endpoints
```

### Updated Files
```
✅ backend/services/agents.service.js        - Now with actual fix execution
✅ backend/services/taskStore.service.js     - Enhanced task management
✅ backend/index.js                          - Added webhook & scheduler routes
```

### Documentation
```
✅ AUTONOMOUS_GUIDE.md     - Complete configuration guide
✅ QUICK_START.md          - This file
```

## 🎯 Quick Setup (5 minutes)

### Step 1: Install Dependencies ✅ (Already Done)
```bash
npm install node-cron @octokit/rest simple-git
```

### Step 2: Configure Environment
Create/update `.env`:
```env
GITHUB_TOKEN=ghp_your_token_here
WEBHOOK_SECRET=your_secret_key
PORT=5000
GEMINI_API_KEY=your_gemini_key
```

📌 **Get GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select: `repo`, `workflow`
4. Copy token to `.env`

📌 **Get Webhook Secret:**
Just use any random string (min 16 chars):
```bash
openssl rand -hex 16
# Output: a7f3e9c2b1d8f4a6e5c9b2d1f8a4e7c6
```

### Step 3: Start Server
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
📌 Autonomous Agent System ENABLED
✅ Webhooks: http://localhost:5000/webhooks
⏰ Scheduler: http://localhost:5000/scheduler
```

### Step 4: Enable GitHub Webhooks (To Auto-Trigger)

In your repo → Settings → Webhooks → Add webhook:
- **Payload URL**: `https://your-domain.com/webhooks/github`
- **Content type**: `application/json`
- **Secret**: Your webhook secret from `.env`
- **Events**: Push, Pull requests, Releases
- **Active**: ✅ Checked

### Step 5: Start Automated Monitoring

```bash
# Start monitoring your repo hourly
curl -X POST http://localhost:5000/scheduler/monitor/start \
  -H "Content-Type: application/json" \
  -d '{
    "repos": ["https://github.com/your-user/your-repo"],
    "cronExpression": "0 * * * *"
  }'

# Start auto-fixing every 30 minutes
curl -X POST http://localhost:5000/scheduler/autofix/start \
  -H "Content-Type: application/json" \
  -d '{
    "repoPath": "/path/to/your/repo",
    "cronExpression": "*/30 * * * *"
  }'

# Start auto-committing hourly
curl -X POST http://localhost:5000/scheduler/commit/start \
  -H "Content-Type: application/json" \
  -d '{
    "repoPath": "/path/to/your/repo",
    "cronExpression": "0 * * * *"
  }'
```

**Done!** Your system is now fully automated! 🎉

## 📊 How It Works

### Auto-Trigger Flow (on Push)
```
Developer pushes code
    ↓
GitHub sends webhook
    ↓
/webhooks/github receives it
    ↓
Analyzes code
    ↓
Finds issues
    ↓
AUTOMATICALLY applies fixes
    ↓
AUTOMATICALLY commits
    ↓
AUTOMATICALLY pushes
```

### Scheduled Flow (background)
```
Cron timer triggers
    ↓
Scheduler runs analysis
    ↓
Finds issues in repo
    ↓
AUTOMATICALLY fixes them
    ↓
AUTOMATICALLY commits
    ↓
AUTOMATICALLY pushes
    ↓
Repeats every 30 min
```

## 🔍 Testing

### Test Webhook Endpoint
```bash
curl http://localhost:5000/webhooks/test
```

Expected response:
```json
{
  "success": true,
  "message": "Webhook endpoint is operational",
  "timestamp": "2024-03-27T10:30:45.123Z"
}
```

### Check Scheduled Jobs
```bash
curl http://localhost:5000/scheduler/jobs
```

Expected response:
```json
{
  "success": true,
  "jobs": [
    {
      "name": "REPO_MONITORING",
      "status": "RUNNING"
    },
    {
      "name": "AUTOFIX",
      "status": "RUNNING"
    }
  ]
}
```

### View Task Status
```bash
curl http://localhost:5000/tasks
```

### Check System Health
```bash
curl http://localhost:5000/health
```

## 🛠️ Common Commands

### Stop a Job
```bash
curl -X POST http://localhost:5000/scheduler/jobs/AUTOFIX/stop
```

### Stop All Jobs
```bash
curl -X POST http://localhost:5000/scheduler/jobs/stop-all
```

### Manually Trigger Analysis
```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "your code here"}'
```

## 📝 Key Configuration Options

| Setting | What It Does |
|---------|-------------|
| `GITHUB_TOKEN` | Enables auto-push and PR creation |
| `WEBHOOK_SECRET` | Verifies webhooks are from GitHub |
| `cronExpression` | How often jobs run (e.g., `0 * * * *` = hourly) |
| `repoPath` | Local path to repository for fixes |

## ⚠️ Important Notes

1. **Git Config**: Ensure git is configured:
   ```bash
   git config --global user.email "you@example.com"
   git config --global user.name "Your Name"
   ```

2. **Permissions**: Make sure the app has write access to repo folder

3. **Logs**: All operations are logged. Check `/audit` endpoint

4. **Rate Limits**: GitHub has rate limits (60 public API calls/hour without auth)

## 🔐 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ `GITHUB_TOKEN` is kept private
- ✅ `WEBHOOK_SECRET` is used for signature verification
- ✅ Server validates all webhooks before processing
- ✅ Fix application runs only on detected issues

## 📚 More Info

For detailed configuration and advanced options, see: **AUTONOMOUS_GUIDE.md**

---

## 🎯 Next Steps

1. **Configure `.env`** with your tokens
2. **Set up GitHub Webhook** for auto-triggers
3. **Start scheduler** for background jobs
4. **Monitor logs** to see autonomy in action
5. **Push code** and watch it automatically analyze and fix!

Your multimodel agent system is now fully autonomous! 🚀🤖

