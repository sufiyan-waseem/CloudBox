import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import File from "../models/file.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ All routes below require authentication
router.use(auth);

// VIEW files only of logged-in user
router.get("/", async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.render("file", { files, currentUser: { id: req.user.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPLOAD file (belongs to logged-in user)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 🔹 Detect type (image or raw)
    let resourceType = "auto";
    const nonImageFormats = ["pdf", "docx", "pptx", "zip", "txt"];
    const ext = req.file.originalname.split(".").pop().toLowerCase();
    if (nonImageFormats.includes(ext)) {
      resourceType = "raw"; // ✅ Force raw for non-image files
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "drive_project",
          use_filename: true,
          unique_filename: false,
          access_mode: "public",
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const file = new File({
      originalName: req.file.originalname,
      filename: result.public_id,
      cloudinary_id: result.public_id,
      url: result.secure_url,
      // ✅ Fix: use Cloudinary format OR fallback to file extension
      format: result.format || ext,
      size: req.file.size,
      userId: req.user.id,
    });

    await file.save();
    res.redirect("/files");
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE (only if owner)
router.delete("/delete/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    // ✅ Detect correct resource type for Cloudinary
    let resourceType = "image";
    const nonImageFormats = ["pdf", "docx", "pptx", "zip", "txt"];
    if (nonImageFormats.includes(file.format)) {
      resourceType = "raw";
    }

    await cloudinary.uploader.destroy(file.cloudinary_id, {
      resource_type: resourceType,
    });
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
