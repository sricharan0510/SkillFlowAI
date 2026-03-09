const Exam = require("../models/examModel");
const Material = require("../models/materialModel");
const { generateExamQuestions } = require("../utils/aiService");

exports.generateExam = async (req, res) => {
  try {
    const { materialId, config } = req.body;

    if (!materialId || !config) {
      return res.status(400).json({ message: "Material ID and config are required" });
    }

    const requiredFields = ['scope', 'difficulty', 'questionTypes', 'mode'];
    for (const field of requiredFields) {
      if (!config[field]) {
        return res.status(400).json({ message: `${field} is required in config` });
      }
    }

    const hasQuestionType = Object.values(config.questionTypes).some(type => type === true);
    if (!hasQuestionType) {
      return res.status(400).json({ message: "At least one question type must be selected" });
    }

    const material = await Material.findOne({ _id: materialId, userId: req.user.id });
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const exam = await Exam.create({
      userId: req.user.id,
      materialId: materialId,
      title: `${material.title} - Exam`,
      config: config,
      status: "generating",
    });

    setImmediate(async () => {
      try {
        const rawQuestions = await generateExamQuestions(material.extractedText, config);
        
        const allowedTypes = Object.keys(config.questionTypes).filter(type => config.questionTypes[type]);
        const questions = rawQuestions.filter(q => allowedTypes.includes(q.type));

        if (questions.length === 0) {
           throw new Error("No questions generated matching selected types");
        }

        await Exam.findByIdAndUpdate(exam._id, {
          questions: questions,
          totalQuestions: questions.length,
          status: "ready",
        });

        console.log(`Exam ${exam._id} generated successfully with ${questions.length} questions`);
      } catch (error) {
        console.error("Exam generation failed:", error);
        await Exam.findByIdAndUpdate(exam._id, {
          status: "failed",
        });
      }
    });

    return res.status(201).json({
      success: true,
      message: "Exam generation started",
      examId: exam._id,
      status: "generating",
    });

  } catch (error) {
    console.error("Generate exam error:", error);
    return res.status(500).json({ message: "Failed to generate exam" });
  }
};

exports.getExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({ _id: examId, userId: req.user.id })
      .populate('materialId', 'title')
      .select('-questions.correct'); 

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.result && exam.result.isCompleted) {
       return res.status(403).json({ 
         message: "Exam already completed",
         isCompleted: true,
         examId: exam._id 
       });
    }

    return res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        materialTitle: exam.materialId.title,
        config: exam.config,
        questions: exam.questions,
        status: exam.status,
        totalQuestions: exam.totalQuestions,
        createdAt: exam.createdAt,
      },
    });

  } catch (error) {
    console.error("Get exam error:", error);
    return res.status(500).json({ message: "Failed to fetch exam" });
  }
};

exports.getExamWithAnswers = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({ _id: examId, userId: req.user.id })
      .populate('materialId', 'title');

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json({
      success: true,
      exam: exam,
    });

  } catch (error) {
    console.error("Get exam with answers error:", error);
    return res.status(500).json({ message: "Failed to fetch exam" });
  }
};

exports.getUserExams = async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.user.id })
      .populate('materialId', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams: exams.map(exam => ({
        _id: exam._id,
        title: exam.title,
        materialTitle: exam.materialId.title,
        config: exam.config,
        status: exam.status,
        totalQuestions: exam.totalQuestions,
        createdAt: exam.createdAt,
        result: exam.result ? {
            score: exam.result.score,
            isCompleted: exam.result.isCompleted
        } : null
      })),
    });

  } catch (error) {
    console.error("Get user exams error:", error);
    return res.status(500).json({ message: "Failed to fetch exams" });
  }
};

exports.saveExamResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const { score, timeSpent, markedForReview, answers } = req.body;

    console.log('Saving exam result for examId:', examId);

    const exam = await Exam.findOne({ _id: examId, userId: req.user.id });
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.result && exam.result.isCompleted) {
        return res.status(400).json({ message: "Exam already submitted" });
    }

    if (!exam.questions || !Array.isArray(exam.questions)) {
      return res.status(400).json({ message: "Exam questions not found" });
    }

    let correctAnswers = 0;
    let notAnswered = 0;
    const totalQuestions = exam.questions.length;

    exam.questions.forEach((q) => {
      try {
        const questionIdStr = q._id.toString();
        const userAnswer = answers ? answers[questionIdStr] : undefined;
        
        if (userAnswer === undefined || userAnswer === null || userAnswer === "") {
          notAnswered++;
        } else {
          let isCorrect = false;
          if (q.correct !== undefined) {
            if (typeof q.correct === 'boolean') {
              isCorrect = userAnswer === q.correct;
            } else {
              isCorrect = userAnswer?.toString().trim().toLowerCase() === q.correct?.toString().trim().toLowerCase();
            }
          }
          if (isCorrect) correctAnswers++;
        }
      } catch (err) {
        console.error('Error processing question calculation:', err);
      }
    });

    const computedScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    exam.result = {
      score: computedScore,
      correctAnswers,
      totalQuestions,
      timeSpent: timeSpent || 0,
      markedForReview: markedForReview || 0,
      notAnswered,
      answers: answers || {},
      completedAt: new Date(),
      isCompleted: true,
    };
    
    exam.markModified('result');

    await exam.save();

    console.log('Exam result saved successfully. Score:', computedScore);

    return res.status(200).json({
      success: true,
      message: "Exam result saved successfully",
      exam,
    });
  } catch (error) {
    console.error("Save exam result error:", error);
    return res.status(500).json({ message: "Failed to save exam result", error: error.message });
  }
};

exports.retakeExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const originalExam = await Exam.findOne({ _id: examId, userId: req.user.id });
    if (!originalExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const newExam = await Exam.create({
      userId: req.user.id,
      materialId: originalExam.materialId,
      title: originalExam.title,
      config: originalExam.config,
      status: "generating",
      retakeOf: examId,
    });

    const Material = require("../models/materialModel");
    const material = await Material.findById(originalExam.materialId);
    
    setImmediate(async () => {
      try {
        const { generateExamQuestions } = require("../utils/aiService");
        const rawQuestions = await generateExamQuestions(material.extractedText, originalExam.config);
        
        const allowedTypes = Object.keys(originalExam.config.questionTypes).filter(type => originalExam.config.questionTypes[type]);
        const questions = rawQuestions.filter(q => allowedTypes.includes(q.type));

        await Exam.findByIdAndUpdate(newExam._id, {
          questions: questions,
          totalQuestions: questions.length,
          status: "ready",
        });

      } catch (error) {
        console.error("Retake exam generation failed:", error);
        await Exam.findByIdAndUpdate(newExam._id, {
          status: "failed",
        });
      }
    });

    return res.status(201).json({
      success: true,
      message: "Retake exam created",
      examId: newExam._id,
      status: "generating",
    });
  } catch (error) {
    console.error("Retake exam error:", error);
    return res.status(500).json({ message: "Failed to create retake exam" });
  }
};