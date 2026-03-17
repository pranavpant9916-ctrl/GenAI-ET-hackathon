exports.filterFiles = (files) => {
    return files.filter(file =>
        file.name.endsWith(".js") ||
        file.name.endsWith(".ts")
    );
};