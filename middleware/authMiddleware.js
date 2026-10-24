const JWT = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Authentication failed",
    });
  }
  JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).send({
        success: false,
        message: "Authentication failed",
      });
    }
    req.body.userId = decode.userId;
    next();
  });
};
