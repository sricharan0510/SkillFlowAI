const express = require("express");
const router = express.Router();

const {
  startInterview,
  submitAnswer,
  getInterview,
  finishInterview,
  getUserInterviews 
} = require("../controllers/interviewController");

router.get("/", getUserInterviews); 

router.post("/start", startInterview);
router.post("/answer", submitAnswer);
router.get("/:id", getInterview);
router.post("/finish", finishInterview);

module.exports = router;