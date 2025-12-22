const Material = require("../models/materialModel");
const User = require("../models/userModel");
const uploadPdfToCloudinary = require("../utils/uploadPdf");
const { extractTextFromPDF } = require("../utils/pdfExtractor");

exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // load the full user document from DB (req.user is JWT payload)
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.credits || user.credits.pdfUploadsRemaining <= 0) {
      return res.status(403).json({
        message: "PDF upload limit reached. Upgrade your plan.",
      });
    }

    // upload to Cloudinary
    const cloudinaryResult = await uploadPdfToCloudinary(req.file.buffer);
    console.log("Cloudinary upload result:", cloudinaryResult);

    const { text, pages } = await extractTextFromPDF(req.file.buffer);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        message: "Unable to extract text from the PDF",
      });
    }

    const material = await Material.create({
      userId: user.id,
      title: req.body.title.trim(),
      fileUrl: cloudinaryResult.secure_url,
      extractedText: text,
      pageCount: pages,
      status: "completed",
    });

    user.credits.pdfUploadsRemaining -= 1;
    await user.save();

    return res.status(201).json({
      message: "PDF uploaded and processed successfully",
      material,
    });

  } catch (error) {
    console.error("Material upload error:", error);
    return res.status(500).json({
      message: "Failed to upload and process PDF",
    });
  }
};
