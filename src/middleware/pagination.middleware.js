// src/middleware/pagination.middleware.js

module.exports = (req, res, next) => {
  // parse page & limit dari query string
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 20;

  const offset = (page - 1) * limit;

  req.pagination = { page, limit, offset };
  next();
};