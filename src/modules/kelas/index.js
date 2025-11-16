// src/modules/kelas/index.js
const router = require("./kelas.routes");

module.exports = router;
module.exports.model = require("./kelas.model");
module.exports.controller = require("./kelas.controller");
module.exports.service = require("./kelas.service");
module.exports.validation = require("./kelas.validation");