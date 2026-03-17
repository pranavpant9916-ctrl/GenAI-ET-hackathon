const axios = require("axios");

module.exports = async (code) => {
    try {
        return "AI Suggestion: Refactor code for better readability";
    } catch (err) {
        return "AI analysis failed";
    }
};