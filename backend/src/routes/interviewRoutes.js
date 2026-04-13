const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  startInterview,
  submitAnswer,
  getInterview,
  finishInterview,
  getUserInterviews 
} = require("../controllers/interviewController");

router.get("/", authMiddleware, getUserInterviews);

router.post("/start", authMiddleware, startInterview);
router.post("/answer", authMiddleware, submitAnswer);
router.get("/:id", authMiddleware, getInterview);
router.post("/finish", authMiddleware, finishInterview);

module.exports = router;