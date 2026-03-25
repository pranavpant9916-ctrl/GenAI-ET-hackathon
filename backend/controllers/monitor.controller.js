const { getTasks } = require("../services/taskStore.service");
const { runHealthMonitor } = require("../services/monitor.service");

exports.monitorWorkflow = (req, res) => {
    try {
        const tasks = getTasks();

        const report = runHealthMonitor(tasks);

        res.json({
            success: true,
            report
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Monitoring failed" });
    }
};