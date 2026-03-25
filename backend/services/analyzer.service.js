const { geminiReview } = require("./gemini.service");

const extractTasksFromContent = (file) => {
    const tasks = [];

    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
        if (line.includes("TODO") || line.includes("FIXME")) {
            tasks.push({
                title: line.trim(),
                file: file.path,
                line: index + 1,
                type: "CODE_SMELL",
                priority: line.includes("FIXME") ? "HIGH" : "MEDIUM",
                status: "PENDING",
                reason: "Detected TODO/FIXME in code",
                createdAt: new Date() // ✅ ADDED
            });
        }

        if (line.includes("console.log")) {
            tasks.push({
                title: "Remove console.log",
                file: file.path,
                line: index + 1,
                type: "QUALITY",
                priority: "LOW",
                status: "PENDING",
                reason: "Debug statement in production",
                createdAt: new Date() // ✅ ADDED
            });
        }
    });

    return tasks;
};

exports.analyzeFiles = async (files) => {
    let allTasks = [];

    for (let file of files) {
        const tasks = extractTasksFromContent(file);

        let aiSummary = "No insights";

        try {
            const trimmedContent = file.content.slice(0, 3000);
            aiSummary = await geminiReview(trimmedContent);
        } catch (err) {
            console.log("Gemini failed:", err.message);
        }

        const enrichedTasks = tasks.map(task => ({
            ...task,
            aiInsight: aiSummary
        }));

        allTasks = [...allTasks, ...enrichedTasks];
    }

    return allTasks;
};