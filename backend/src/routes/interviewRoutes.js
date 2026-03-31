const express = require("express");
const router = express.Router();

const {
  startInterview,
  submitAnswer,
  getInterview,
  finishInterview
} = require("../controllers/interviewController");

router.post("/start", startInterview);
router.post("/answer", submitAnswer);
router.post("/finish", finishInterview);
router.get("/:id", getInterview);

module.exports = router;