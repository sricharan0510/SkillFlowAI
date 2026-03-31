const interviewService = require("../services/interviewService");

exports.startInterview = async (req, res) => {
  try {
    const { role, difficulty, experience, number = 5 } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required to start an interview." });
    }

    const session = await interviewService.startInterview({
      number,
      role,
      difficulty,
      experience
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("[Controller] Start Interview Error:", error.message);
    res.status(500).json({ error: "Failed to start interview. Please try again." });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: "sessionId and answer are required." });
    }

    const result = await interviewService.submitAnswer({
      sessionId,
      answer
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("[Controller] Submit Answer Error:", error.message);
    const statusCode = error.message.includes("not found") || error.message.includes("completed") ? 400 : 500;
    res.status(statusCode).json({ error: error.message || "Failed to submit answer." });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Interview ID is required." });

    const session = await interviewService.getInterview(id);
    res.status(200).json(session);
  } catch (error) {
    console.error("[Controller] Get Interview Error:", error.message);
    res.status(404).json({ error: error.message || "Failed to get interview details." });
  }
};

exports.finishInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    const report = await interviewService.finishInterview(sessionId);
    res.status(200).json(report);
  } catch (error) {
    console.error("[Controller] Finish Interview Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate interview report." });
  }
};