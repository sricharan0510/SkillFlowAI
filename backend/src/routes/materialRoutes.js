const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { uploadMaterial, generateMaterialSummary } = require("../controllers/materialController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/upload",
  authMiddleware,
  upload.single("pdf"), 
  uploadMaterial
);

router.post(
  "/:materialId/summarize",
  authMiddleware,
  generateMaterialSummary
);

const { getMaterials } = require("../controllers/materialController"); // Assuming you have this
router.get(
    "/", 
    authMiddleware, 
    getMaterials
);

module.exports = router;