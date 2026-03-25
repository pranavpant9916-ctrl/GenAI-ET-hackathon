const express = require("express");
const router = express.Router();

const { getTasks } = require("../services/taskStore.service");

router.get("/", (req, res) => {
    res.json(getTasks());
});

module.exports = router;