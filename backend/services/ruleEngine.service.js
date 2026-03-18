module.exports = (code) => {
    let issues = [];

    if (code.includes("console.log")) {
        issues.push({
            type: "QUALITY",
            severity: "LOW",
            message: "Avoid console.log in production",
            fix: "Remove console.log or use logger",
            ruleId: "NO_CONSOLE"
        });
    }

    if (code.includes("var ")) {
        issues.push({
            type: "QUALITY",
            severity: "MEDIUM",
            message: "Use let/const instead of var",
            fix: "Replace var with let/const",
            ruleId: "NO_VAR"
        });
    }

    return issues;
};