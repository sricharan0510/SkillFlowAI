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
router.get("/:id", getInterview);
router.post("/finish", finishInterview);

module.exports = router;