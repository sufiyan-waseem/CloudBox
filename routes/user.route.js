import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = express.Router();

// ==========================
// GET ROUTES for forms
// ==========================
router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

// ==========================
// POST ROUTES
// ==========================

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ❌ Don't hash here (user.model.js already does)
    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
    });

    await newUser.save();
    console.log(`✅ New user registered: ${username}`);
    res.redirect("/auth/login");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).send("Error registering user");
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const inputUsername = (username || "").trim().toLowerCase();
    const inputPassword = (password || "").trim();

    const user = await User.findOne({ username: inputUsername });
    const isMatch = user ? await bcrypt.compare(inputPassword, user.password) : false;

    if (!user || !isMatch) {
      return res.send("<script>alert('Wrong username or password'); window.location.href='/auth/login';</script>");
    }

    // ✅ Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Send token as cookie
    res.cookie("token", token, { httpOnly: true });
    console.log("✅ Login successful for user:", user.username);

    // ✅ Redirect to files page
    res.redirect("/files");
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("Error logging in");
  }
});

export default router;
