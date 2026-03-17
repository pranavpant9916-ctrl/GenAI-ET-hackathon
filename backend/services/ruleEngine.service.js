const rules = [
    {
        id: "NO_CONSOLE",
        severity: "LOW",
        check: (code) => code.includes("console.log"),
        message: "Avoid console.log in production"
    },
    {
        id: "NO_VAR",
        severity: "MEDIUM",
        check: (code) => code.includes("var "),
        message: "Use let/const instead of var"
    }
];

module.exports = (code) => {
    let issues = [];

    rules.forEach(rule => {
        if (rule.check(code)) {
            issues.push({
                type: "QUALITY",
                severity: rule.severity,
                message: rule.message,
                ruleId: rule.id
            });
        }
    });

    return issues;
};