const axios = require("axios");

const GITHUB_API = "https://api.github.com";

const ignoreExtensions = [".json", ".lock", ".md", ".png", ".jpg", ".svg"];

function isValidFile(name) {
    return (
        (name.endsWith(".js") || name.endsWith(".ts")) &&
        !ignoreExtensions.some(ext => name.endsWith(ext))
    );
}

async function fetchRepoContents(owner, repo, path = "") {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
    const res = await axios.get(url);

    let files = [];

    for (const item of res.data) {
        if (item.type === "file" && isValidFile(item.name)) {
            try {
                const fileRes = await axios.get(item.download_url);
                files.push({
                    name: item.path,
                    content: fileRes.data
                });
            } catch (err) {
                console.log("Skipped:", item.path);
            }
        }

        if (item.type === "dir") {
            if (item.name === "node_modules" || item.name === ".git") continue;

            const nested = await fetchRepoContents(owner, repo, item.path);
            files = files.concat(nested);
        }
    }

    return files;
}

exports.getRepoFiles = async (repoUrl) => {
    const parts = repoUrl.split("/");
    const owner = parts[3];
    const repo = parts[4];

    return await fetchRepoContents(owner, repo);
};