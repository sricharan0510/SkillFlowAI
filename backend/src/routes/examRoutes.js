const express = require("express");
const router = express.Router();
const { generateExam, getExam, getExamWithAnswers, getUserExams, saveExamResult, retakeExam } = require("../controllers/examController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate", authMiddleware, generateExam);
router.post("/:examId/result", authMiddleware, saveExamResult);
router.post("/:examId/retake", authMiddleware, retakeExam);
// THIS MUST COME BEFORE THE /:examId ROUTE TO AVOID ROUTE CONFLICTS
router.get("/:examId/answers", authMiddleware, getExamWithAnswers);
router.get("/:examId", authMiddleware, getExam);
router.get("/", authMiddleware, getUserExams);

module.exports = router;