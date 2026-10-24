const userModel = require("../models/userModel");
module.exports = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.body.userId);
    //check admin
    if (user?.role !== "admin") {
      return res.status(401).send({
        success: false,
        message: "Not authorised",
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    return res.status(401).send({
      success: false,
      message: "Authentication failed",
    });
  }
};