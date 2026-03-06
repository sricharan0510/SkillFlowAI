const Exam = require("../models/examModel");
const Material = require("../models/materialModel");
const { generateExamQuestions } = require("../utils/aiService");

exports.generateExam = async (req, res) => {
  try {
    const { materialId, config } = req.body;

    if (!materialId || !config) {
      return res.status(400).json({ message: "Material ID and config are required" });
    }

    // Validate config
    const requiredFields = ['scope', 'difficulty', 'questionTypes', 'mode'];
    for (const field of requiredFields) {
      if (!config[field]) {
        return res.status(400).json({ message: `${field} is required in config` });
      }
    }

    // Check if at least one question type is selected
    const hasQuestionType = Object.values(config.questionTypes).some(type => type === true);
    if (!hasQuestionType) {
      return res.status(400).json({ message: "At least one question type must be selected" });
    }

    // Check if material exists and belongs to user
    const material = await Material.findOne({ _id: materialId, userId: req.user.id });
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Create exam record
    const exam = await Exam.create({
      userId: req.user.id,
      materialId: materialId,
      title: `${material.title} - Exam`,
      config: config,
      status: "generating",
    });

    // Generate questions asynchronously
    setImmediate(async () => {
      try {
        const rawQuestions = await generateExamQuestions(material.extractedText, config);
        
        // BUG FIX 2: Strict Filtering
        // Ensure only requested question types are saved, regardless of what AI returns
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
      .select('-questions.correct'); // Don't send correct answers

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // BUG FIX 3: State Locking
    // Prevent taking an exam that is already completed
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
        // BUG FIX 4: Return result info for history UI
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
    console.log('Request body:', { score, timeSpent, markedForReview, answers: Object.keys(answers || {}) });

    const exam = await Exam.findOne({ _id: examId, userId: req.user.id });
    if (!exam) {
      console.log('Exam not found for id:', examId, 'user:', req.user.id);
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.result && exam.result.isCompleted) {
        console.log('Exam already submitted');
        return res.status(400).json({ message: "Exam already submitted" });
    }

    if (!exam.questions || !Array.isArray(exam.questions)) {
      console.log('Exam questions not found or not an array');
      return res.status(400).json({ message: "Exam questions not found" });
    }

    // Compute stats from answers and questions
    let correctAnswers = 0;
    let notAnswered = 0;
    const totalQuestions = exam.questions.length;

    console.log('Computing stats for', totalQuestions, 'questions');

    exam.questions.forEach((q, index) => {
      try {
        const questionId = q._id || q.id;
        const userAnswer = answers ? answers[questionId] : undefined;
        
        if (userAnswer === undefined || userAnswer === null) {
          notAnswered++;
        } else {
          let isCorrect = false;
          if (q.correct !== undefined) {
            if (typeof q.correct === 'boolean') {
              isCorrect = userAnswer === q.correct;
            } else {
              isCorrect = userAnswer?.toString().toLowerCase() === q.correct?.toString().toLowerCase();
            }
          }
          if (isCorrect) correctAnswers++;
        }
      } catch (err) {
        console.error('Error processing question', index, ':', err);
      }
    });

    const computedScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    console.log('Computed stats:', { correctAnswers, notAnswered, totalQuestions, computedScore });

    // Save result
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

    await exam.save();

    console.log('Exam result saved successfully');

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

    // Create a new exam with same config but different questions
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
        
        // BUG FIX 2: Strict Filtering applied to Retakes as well
        const allowedTypes = Object.keys(originalExam.config.questionTypes).filter(type => originalExam.config.questionTypes[type]);
        const questions = rawQuestions.filter(q => allowedTypes.includes(q.type));

        await Exam.findByIdAndUpdate(newExam._id, {
          questions: questions,
          totalQuestions: questions.length,
          status: "ready",
        });

        console.log(`Retake exam ${newExam._id} generated successfully`);
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