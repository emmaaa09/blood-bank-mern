const userModel = require("../models/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Roles that may self-register. "admin" accounts are created with
// `npm run create-admin` and can never be created through the public API.
const SELF_REGISTER_ROLES = ["donar", "hospital", "organisation"];

// Never send the password hash back to the client
const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

const registerController = async (req, res) => {
  try {
    const {
      role,
      name,
      organisationName,
      hospitalName,
      email,
      password,
      website,
      address,
      phone,
    } = req.body;

    if (!SELF_REGISTER_ROLES.includes(role)) {
      return res.status(400).send({
        success: false,
        message: "Invalid role",
      });
    }
    if (!email || !password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Email and a password of at least 6 characters are required",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Only pick the fields we expect, never save req.body as-is
    const user = new userModel({
      role,
      name,
      organisationName,
      hospitalName,
      email,
      password: hashedPassword,
      website,
      address,
      phone,
    });
    await user.save();

    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in register API",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    // Same message for every failure so attackers can't tell which part was wrong
    if (!user || user.role !== req.body.role) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }
    const comparePassword = await bcrypt.compare(
      req.body.password || "",
      user.password
    );
    if (!comparePassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in login API",
    });
  }
};

const currentUserController = async (req, res) => {
  try {
    const user = await userModel
      .findOne({ _id: req.body.userId })
      .select("-password");
    return res.status(200).send({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting current user",
    });
  }
};

module.exports = { registerController, loginController, currentUserController };
