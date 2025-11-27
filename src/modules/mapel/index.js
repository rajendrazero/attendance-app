// src/modules/mapel/index.js
const router = require("./mapel.routes");

module.exports = router;
module.exports.model = require("./mapel.model");
module.exports.controller = require("./mapel.controller");
module.exports.service = require("./mapel.service");
module.exports.validation = require("./mapel.validation");
