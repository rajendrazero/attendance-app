// src/modules/guru_mapel_kelas/index.js
const router = require("./gmk.routes");

module.exports = router;
module.exports.model = require("./gmk.model");
module.exports.controller = require("./gmk.controller");
module.exports.service = require("./gmk.service");
module.exports.validation = require("./gmk.validation");
