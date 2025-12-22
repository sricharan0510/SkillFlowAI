const Material = require("../models/materialModel");
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

    const user = req.user;

    if (!user.credits || user.credits.pdfUploadsRemaining <= 0) {
      return res.status(403).json({
        message: "PDF upload limit reached. Upgrade your plan.",
      });
    }

    const cloudinaryResult = await uploadPdfToCloudinary(req.file.buffer);

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
