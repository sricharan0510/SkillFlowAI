const Material = require("../models/materialModel");
const User = require("../models/userModel");
const uploadPdfToCloudinary = require("../utils/uploadPdf");
const { extractTextFromPDF } = require("../utils/pdfExtractor");

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("Get materials error:", error);
    return res.status(500).json({ message: "Failed to fetch materials" });
  }
};

exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "PDF file is required" });
    if (!req.body.title) return res.status(400).json({ message: "Title is required" });

    const category = req.body.category || "notes"; 
    const validCategories = ["resume", "exams", "notes"];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category selected" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cloudinaryResult = await uploadPdfToCloudinary(req.file.buffer);
    const { text, pages } = await extractTextFromPDF(req.file.buffer);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Unable to extract text from PDF" });
    }

    const material = await Material.create({
      userId: user.id,
      title: req.body.title.trim(),
      category: category, 
      fileUrl: cloudinaryResult.secure_url,
      extractedText: text,
      pageCount: pages,
      status: "completed",
    });

    await user.save();

    return res.status(201).json({
      message: "Material uploaded successfully",
      material
    });

  } catch (error) {
    console.error("Material upload error:", error);
    return res.status(500).json({ message: "Failed to process PDF" });
  }
};

const { generateSummaryAI } = require("../utils/aiService");

exports.generateMaterialSummary = async (req, res) => {
  try {
    const { materialId } = req.params;
    
    const { mode = "entire", topic = "" } = req.body; 

    const material = await Material.findOne({ _id: materialId, userId: req.user.id });
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (mode === "specific" && !topic.trim()) {
      return res.status(400).json({ message: "Topic name is required for specific mode." });
    }

    console.log(`Generating summary... Mode: ${mode}, Topic: ${topic}`);
    const aiResponse = await generateSummaryAI(material.extractedText, mode, topic);
    
    // Save the generated summary to the material for both entire and specific modes
    material.summary = aiResponse;
    await material.save();

    return res.status(200).json({
      message: "Success",
      summary: aiResponse,
      mode: mode
    });

  } catch (error) {
    console.error("Summary Controller Error:", error);
    return res.status(500).json({ message: "Failed to generate summary" });
  }
};