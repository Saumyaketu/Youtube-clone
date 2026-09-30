import jwt from "jsonwebtoken";
import users from "../Modals/Auth.js";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

export const createAuthToken = (user) =>
  jwt.sign({ userId: user._id.toString() }, getJwtSecret(), {
    expiresIn: "7d",
  });

export const verifyAuthToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const user = await users.findById(payload.userId);

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireMatchingUser = (req, res, next) => {
  if (req.params.userId !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized for this user" });
  }

  return next();
};