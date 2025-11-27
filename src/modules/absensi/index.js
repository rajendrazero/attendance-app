// src/modules/absensi/index.js
const router = require("./absensi.routes");

module.exports = router;
module.exports.model = require("./absensi.model");
module.exports.controller = require("./absensi.controller");
module.exports.service = require("./absensi.service");
module.exports.helper = require("./absensi.helper");
module.exports.validation = require("./absensi.validation");
