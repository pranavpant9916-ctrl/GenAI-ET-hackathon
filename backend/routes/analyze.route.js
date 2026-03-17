const express = require("express");
const router = express.Router();

const { analyzeRepo } = require();

router.post("/", analyzeRepo);

module.exports = router; 