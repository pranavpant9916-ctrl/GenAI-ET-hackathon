require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyzeRoute = require("./routes/analyze.route");
const uploadRoute = require("./routes/upload.route");
const webhookRoute = require("./routes/webhook.route");
const schedulerRoute = require("./routes/scheduler.route");
const { addLog } = require("./services/audit.service");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/analyze", analyzeRoute);
app.use("/api/upload", uploadRoute);
app.use("/tasks", require("./routes/task.route"));
app.use("/agents", require("./routes/agent.route"));
app.use("/monitor", require("./routes/monitor.route"));
app.use("/webhooks", webhookRoute);
app.use("/scheduler", schedulerRoute);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "operational", 
        timestamp: new Date().toISOString(),
        autonomousMode: true
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("📌 Autonomous Agent System ENABLED");
    console.log(`✅ Webhooks: http://localhost:${PORT}/webhooks`);
    console.log(`⏰ Scheduler: http://localhost:${PORT}/scheduler`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    
    // Log startup
    addLog({ 
        action: "SERVER_START", 
        port: PORT,
        autonomousMode: true
    });
});