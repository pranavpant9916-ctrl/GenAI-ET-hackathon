const { getRepoFiles } = require("../services/repo.service");
const runRules = require("../services/ruleEngine.service");
const runSecurityChecks = require("../services/security.service");
const geminiReview = require("../services/gemini.service");
const { addLog } = require("../services/audit.service");

exports.analyzeRepo = async (req, res) => {
    try {
        const { repoUrl } = req.body;

        const files = await getRepoFiles(repoUrl);

        const limitedFiles = files.slice(0, 15); // IMPORTANT

        let results = [];

        for (const file of limitedFiles) {
            const { name, content } = file;

            const ruleIssues = runRules(content);
            const securityIssues = runSecurityChecks(content);
            const aiReview = await geminiReview(content);

            const issues = [...ruleIssues, ...securityIssues];

            const fileResult = {
                file: name,
                issues,
                aiReview
            };

            addLog(fileResult);
            results.push(fileResult);
        }

        const summary = {
            totalFiles: results.length,
            totalIssues: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        results.forEach(f => {
            f.issues.forEach(issue => {
                summary.totalIssues++;
                summary[issue.severity.toLowerCase()]++;
            });
        });

        res.json({ summary, files: results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Analysis failed" });
    }
};