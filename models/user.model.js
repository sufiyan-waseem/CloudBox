import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // bcryptjs recommended for ESM

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minLength: [3, "Username must be at least 3 characters long"]
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    minLength: [7, "Email must be at least 13 characters long"]
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: [5, "Password must be at least 5 characters long"]
  }
});

// Optional: Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", userSchema);
