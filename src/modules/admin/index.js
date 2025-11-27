// src/modules/admin/index.js
const router = require("./admin.routes");

module.exports = router;
module.exports.controller = require("./dashboard.controller");
module.exports.service = require("./dashboard.service");