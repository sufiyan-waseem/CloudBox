const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const File = require("../models/file.model");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// VIEW all files
router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.render("file", { files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPLOAD
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "drive_project" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    const file = new File({
      originalName: req.file.originalname,
      filename: result.public_id,
      cloudinary_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: req.file.size,
    });

    await file.save();
    res.redirect("/files");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE
router.post("/delete/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    await cloudinary.uploader.destroy(file.cloudinary_id, { resource_type: "auto" });
    await File.findByIdAndDelete(req.params.id);

    res.redirect("/files");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


