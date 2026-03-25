const { fetchRepoFiles } = require("./repo.services");
const { analyzeFiles } = require("./analyzer.service");
const { addLog } = require("./audit.service");

// 1. RETRIEVER AGENT
const retrieverAgent = async (repoUrl) => {
    const data = await fetchRepoFiles(repoUrl);
    return data.files;
};

// 2. ANALYZER AGENT
const analyzerAgent = async (files) => {
    return await analyzeFiles(files);
};

// 3. DECISION AGENT
const decisionAgent = (tasks) => {
    return tasks.map(task => {
        let priorityScore = 0;

        if (task.priority === "HIGH") priorityScore = 3;
        else if (task.priority === "MEDIUM") priorityScore = 2;
        else priorityScore = 1;

        return {
            ...task,
            decisionScore: priorityScore,
            decision: priorityScore >= 3 ? "IMMEDIATE_ACTION" : "SCHEDULE"
        };
    });
};

// 4. EXECUTION AGENT
const executionAgent = (tasks) => {
    return tasks.map(task => ({
        ...task,
        executionPlan: `Fix issue in ${task.file} at line ${task.line}`
    }));
};

// 5. VERIFIER AGENT
const verifierAgent = (tasks) => {
    const seen = new Set();

    return tasks.filter(task => {
        const key = `${task.file}-${task.line}-${task.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

// MAIN ORCHESTRATOR
exports.runMultiAgentPipeline = async (repoUrl) => {
    addLog({ action: "PIPELINE_START", repo: repoUrl });

    const files = await retrieverAgent(repoUrl);
    addLog({ action: "RETRIEVAL_DONE", count: files.length });

    const analyzed = await analyzerAgent(files);
    addLog({ action: "ANALYSIS_DONE", count: analyzed.length });

    const decided = decisionAgent(analyzed);
    addLog({ action: "DECISION_DONE" });

    const executed = executionAgent(decided);
    addLog({ action: "EXECUTION_DONE" });

    const verified = verifierAgent(executed);
    addLog({ action: "VERIFICATION_DONE", count: verified.length });

    return verified;
};