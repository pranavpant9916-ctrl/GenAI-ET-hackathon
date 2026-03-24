const VALID_EXT = [".js", ".ts", ".jsx", ".py"];

exports.filterFiles = (files) => {
    return files.filter(file => {
        if (
            file.path.includes("node_modules") ||
            file.path.includes(".git") ||
            file.path.includes("dist")
        ) return false;

        return VALID_EXT.some(ext => file.name.endsWith(ext));
    });
};