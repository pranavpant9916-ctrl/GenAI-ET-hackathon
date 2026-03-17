const { getRepoFiles } = require("../services/repo.service");
const { filterFiles } = require("../utils/fileFilter");
const runRules = require("../services/ruleEngine.service");
const runSecurityChecks = require("../services/security.service");
const geminiReview = require("../services/gemini.service");
const auditLog = require("../services/audit.service");

exports.analyzeRepo = async (req, res) => {
    try {
        const { repoUrl } = req.body;

        const files = await getRepoFiles(repoUrl);
        const validFiles = filterFiles(files);

        let results = [];

        for (const file of validFiles) {
            const { name, content } = file;

            const ruleIssues = runRules(content);
            const securityIssues = runSecurityChecks(content);
            const aiReview = await geminiReview(content);

            const fileResult = {
                file: name,
                issues: [...ruleIssues, ...securityIssues],
                aiReview
            };

            auditLog(fileResult);
            results.push(fileResult);
        }

        res.json({
            summary: {
                totalFiles: results.length,
                totalIssues: results.reduce((acc, f) => acc + f.issues.length, 0)
            },
            files: results
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Analysis failed" });
    }
};