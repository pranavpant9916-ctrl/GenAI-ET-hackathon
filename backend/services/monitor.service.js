const { addLog } = require("./audit.service");

// simulate SLA (in ms for demo)
const SLA_TIME = 1000 * 60 * 5; // 5 minutes

// 1. detect stuck tasks
const detectStalls = (tasks) => {
    return tasks.filter(task => task.status === "PENDING");
};

// 2. detect high priority risk
const detectHighRisk = (tasks) => {
    return tasks.filter(task => task.priority === "HIGH");
};

// 3. detect SLA breach risk
const detectSLARisk = (tasks) => {
    const now = Date.now();

    return tasks.filter(task => {
        if (!task.createdAt) return false;

        return (now - new Date(task.createdAt).getTime()) > SLA_TIME;
    });
};

// 4. monitor pipeline
exports.runHealthMonitor = (tasks) => {
    const stalled = detectStalls(tasks);
    const highRisk = detectHighRisk(tasks);
    const slaRisk = detectSLARisk(tasks);

    if (stalled.length > 0) {
        addLog({ action: "STALL_DETECTED", count: stalled.length });
    }

    if (highRisk.length > 0) {
        addLog({ action: "HIGH_RISK_TASKS", count: highRisk.length });
    }

    if (slaRisk.length > 0) {
        addLog({ action: "SLA_BREACH_RISK", count: slaRisk.length });
    }

    return {
        stalled,
        highRisk,
        slaRisk,
        summary: {
            total: tasks.length,
            stalled: stalled.length,
            highRisk: highRisk.length,
            slaRisk: slaRisk.length
        }
    };
};