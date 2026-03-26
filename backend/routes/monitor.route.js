const express = require("express");
const router = express.Router();

const { monitorWorkflow } = require("../controllers/monitor.controller");

router.get("/", monitorWorkflow);

module.exports = router;