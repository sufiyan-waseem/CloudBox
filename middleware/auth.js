import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export default function auth(req, res, next) {
  // ✅ Check token from cookie
  const token = req.cookies?.token;

  if (!token) {
    console.log("❌ No token found");
    return res.redirect("/auth/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user ID available as req.user.id
    next();
  } catch (err) {
    console.log("❌ Invalid token");
    res.redirect("/auth/login");
  }
}
