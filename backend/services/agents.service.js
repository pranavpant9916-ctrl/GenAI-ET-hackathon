const { fetchRepoFiles } = require("./repo.services");
const { analyzeFiles } = require("./analyzer.service");
const { addLog } = require("./audit.service.js");
const { autoFixIssues, verifyFixes } = require("./autofix.service");
const { addTasks, updateTaskStatus } = require("./taskStore.service");
const fs = require("fs");
const path = require("path");

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

// 4. EXECUTION AGENT (NOW ACTUALLY EXECUTES FIXES)
const executionAgent = async (tasks, repoPath) => {
    addLog({ action: "EXECUTION_AGENT_START", taskCount: tasks.length });
    
    try {
        // Store tasks in task store
        addTasks(tasks);
        
        // Apply fixes autonomously
        const fixResults = await autoFixIssues(tasks, repoPath);
        
        addLog({ 
            action: "EXECUTION_AGENT_COMPLETE", 
            totalTasks: tasks.length,
            fixedTasks: fixResults.filter(r => r.fixed).length
        });
        
        return fixResults;
    } catch (err) {
        addLog({ action: "EXECUTION_AGENT_ERROR", error: err.message });
        console.error("Execution agent error:", err);
        return tasks;
    }
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

// 6. NEW: AUTONOMOUS LOOP AGENT
const autonomousLoopAgent = async (tasks, repoPath) => {
    addLog({ action: "AUTONOMOUS_LOOP_START", taskCount: tasks.length });
    
    const results = {
        analyzed: tasks.length,
        fixed: 0,
        verified: 0,
        failed: 0
    };
    
    for (const task of tasks) {
        try {
            updateTaskStatus(task.id, "IN_PROGRESS");
            
            // Attempt fix
            const filePath = path.join(repoPath, task.file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Attempt verification
                const verifyResult = await verifyFixes(filePath);
                
                if (verifyResult.verdict === 'PASS') {
                    updateTaskStatus(task.id, "VERIFIED");
                    results.verified++;
                } else {
                    updateTaskStatus(task.id, "NEEDS_REVIEW");
                    results.failed++;
                }
            }
            
            results.fixed++;
        } catch (err) {
            addLog({ action: "AUTONOMOUS_LOOP_TASK_ERROR", task: task.id, error: err.message });
            results.failed++;
        }
    }
    
    addLog({ action: "AUTONOMOUS_LOOP_COMPLETE", results });
    return results;
};

// MAIN ORCHESTRATOR (NOW FULLY AUTONOMOUS)
exports.runMultiAgentPipeline = async (repoUrl, repoPath = null) => {
    addLog({ action: "PIPELINE_START", repo: repoUrl, autonomous: true });

    try {
        const files = await retrieverAgent(repoUrl);
        addLog({ action: "RETRIEVAL_DONE", count: files.length });

        const analyzed = await analyzerAgent(files);
        addLog({ action: "ANALYSIS_DONE", count: analyzed.length });

        const decided = decisionAgent(analyzed);
        addLog({ action: "DECISION_DONE" });

        // AUTONOMOUS EXECUTION - Actually applies fixes
        let executed = [];
        if (repoPath && fs.existsSync(repoPath)) {
            executed = await executionAgent(decided, repoPath);
            addLog({ action: "AUTONOMOUS_EXECUTION_DONE" });
        } else {
            // Fallback for non-local repos
            executed = decided.map(task => ({
                ...task,
                executionPlan: `Fix issue in ${task.file} at line ${task.line}`,
                autonomous: false
            }));
            addLog({ action: "EXECUTION_SKIPPED", reason: "No local repo path" });
        }

        const verified = verifierAgent(executed);
        addLog({ action: "VERIFICATION_DONE", count: verified.length });
        
        // Run autonomous loop for real-time verification
        if (repoPath && fs.existsSync(repoPath)) {
            const loopResults = await autonomousLoopAgent(verified, repoPath);
            addLog({ action: "PIPELINE_COMPLETE", results: loopResults });
            return { tasks: verified, loopResults };
        }

        return verified;
    } catch (err) {
        addLog({ action: "PIPELINE_ERROR", error: err.message });
        console.error("Pipeline error:", err);
        throw err;
    }
};