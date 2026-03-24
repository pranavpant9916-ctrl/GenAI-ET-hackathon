exports.scan = (files) => {
    const issues = [];

    files.forEach(file => {
        if (file.content.includes("API_KEY")) {
            issues.push({
                file: file.name,
                issue: "Hardcoded API key"
            });
        }

        if (file.content.includes("eval(")) {
            issues.push({
                file: file.name,
                issue: "Use of eval is unsafe"
            });
        }
    });

    return issues;
};