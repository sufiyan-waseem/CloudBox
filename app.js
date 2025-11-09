import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser"; 
import userRoutes from "./routes/user.route.js";
import fileRoutes from "./routes/file.route.js";
import open from "open"; // ✅ Added this line

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine
app.set("view engine", "ejs");
app.set("views", "./views");

// JWT auth middleware
import auth from "./middleware/auth.js"; 

// Routes
app.use("/auth", userRoutes);
app.use("/files", fileRoutes); 

// Home
app.get("/", (req, res) => {
  res.send("Welcome to Drive Project");
});

// MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // ✅ Automatically open browser on Register page
  await open(`http://localhost:${PORT}/auth/register`);
});
