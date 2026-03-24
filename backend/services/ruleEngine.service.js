exports.run = (files) => {
    const issues = [];

    files.forEach(file => {
        if (file.content.includes("console.log")) {
            issues.push({
                file: file.name,
                issue: "Debug logs present"
            });
        }
    });

    return issues;
};