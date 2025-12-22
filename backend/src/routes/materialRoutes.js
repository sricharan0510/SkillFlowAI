const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { uploadMaterial } = require("../controllers/materialController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/upload",
  authMiddleware,
  upload.single("pdf"),
  uploadMaterial
);

module.exports = router;
