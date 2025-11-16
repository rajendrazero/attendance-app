// src/modules/user/index.js
const router = require("./user.routes");

module.exports = router;
module.exports.model = require("./user.model");
module.exports.controller = require("./user.controller");
module.exports.service = require("./user.service");
module.exports.validation = require("./user.validation");