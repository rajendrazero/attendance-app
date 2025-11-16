// src/utils/pagination.js

/**
 * Normalisasi nilai count dari berbagai format Sequelize:
 * - count = 25
 * - count = { count: 25 }
 * - count = [{ count: 25 }]
 * - count = [{ total: "25" }]
 * - count = "25"
 */
function normalizeCount(count) {
    if (!count) return 0;

    // Case: integer langsung
    if (typeof count === "number") return count;

    // Case: string (MySQL/MariaDB or raw count)
    if (typeof count === "string" && !isNaN(count)) return parseInt(count);

    // Case: object { count: x }
    if (typeof count === "object" && count.count !== undefined) {
        return normalizeCount(count.count);
    }

    // Case: array [ { count: x } ]
    if (Array.isArray(count) && count.length > 0) {
        const first = count[0];
        if (first.count !== undefined) return normalizeCount(first.count);

        // case alias: SELECT COUNT(*) as total
        if (first.total !== undefined) return normalizeCount(first.total);
    }

    return 0;
}

/**
 * Response pagination universal
 */
function buildPaginatedResponse(rows, total, page = 1, limit = 20) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
        data: rows,
        meta: {
            total_records: total,
            total_pages: totalPages,
            current_page: page,
            limit
        }
    };
}

/**
 * Helper khusus untuk Sequelize findAndCountAll()
 * result = { rows, count }
 */
function fromSequelizeFindAndCount(result, page = 1, limit = 20) {
    const rows = result.rows || [];
    const total = normalizeCount(result.count);

    return buildPaginatedResponse(rows, total, page, limit);
}

module.exports = {
    buildPaginatedResponse,
    fromSequelizeFindAndCount,
    normalizeCount
};