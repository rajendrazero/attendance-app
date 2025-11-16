// src/modules/jurusan/index.js
const router = require("./jurusan.routes");

module.exports = router;
module.exports.model = require("./jurusan.model");
module.exports.controller = require("./jurusan.controller");
module.exports.service = require("./jurusan.service");
module.exports.validation = require("./jurusan.validation");