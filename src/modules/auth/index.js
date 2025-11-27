// src/modules/auth/index.js
const router = require("./auth.routes");

module.exports = router;
module.exports.controller = require("./auth.controller");
module.exports.service = require("./auth.service");
module.exports.passwordController = require("./password.controller");
module.exports.passwordService = require("./password.service");
module.exports.refreshTokenModel = require("./refreshToken.model");