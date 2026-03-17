const axios = require("axios");

exports.getRepoFiles = async (repoUrl) => {

    return [
        {
            name: "example.js",
            content: "const a = 5; console.log(a);"
        }
    ];
};