const express = require("express");
const router = express.Router();

const { runAgents } = require("../controllers/agent.controller");

router.post("/run", runAgents);

module.exports = router;