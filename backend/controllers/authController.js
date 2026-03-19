const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const SALT_ROUNDS = 10;
const ALLOWED_ROLES = ["customer", "farmer", "vendor", "admin"];

const sanitizeUser = (user) => ({
  id: user.id || user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const register = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const selectedRole = role || "customer";

    if (!ALLOWED_ROLES.includes(selectedRole)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: selectedRole,
    });

    const token = buildAuthToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user" });
  }
};

const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = buildAuthToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login" });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

module.exports = {
  register,
  login,
  me,
};
