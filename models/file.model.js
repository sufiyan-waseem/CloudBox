import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  format: { type: String, required: true },
  size: { type: Number, required: true },
  cloudinary_id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // owner
}, { timestamps: true });

export default mongoose.model("File", fileSchema);
