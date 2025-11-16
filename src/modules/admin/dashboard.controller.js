// src/modules/admin/dashboard.controller.js
const dashboardService = require("./dashboard.service");

const getDashboard = async (req, res, next) => {
  try {
    const date = req.query.date || null;
    const data = await dashboardService.getDashboardStats({ date });
    return res.success(data, "Dashboard stats");
  } catch (err) {
    return next(err);
  }
};

module.exports = { getDashboard };