// src/swagger/index.js
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const logger = require("../config/logger");

// Load YAML safely
function loadYAML(file) {
    try {
        const fullPath = path.join(__dirname, "..", "docs", file);

        if (!fs.existsSync(fullPath)) {
            logger.warn(`Swagger file missing: ${file}`);
            return {};
        }

        const raw = fs.readFileSync(fullPath, "utf8");
        if (!raw.trim()) {
            logger.warn(`Swagger file empty: ${file}`);
            return {};
        }

        const parsed = YAML.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            logger.warn(`Swagger file invalid: ${file}`);
            return {};
        }

        return parsed;
    } catch (err) {
        logger.error(`Error reading ${file}: ${err.message}`);
        return {};
    }
}

// Merge object recursively
function deepMerge(target, source) {
    for (const key in source) {
        if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key])
        ) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

function loadSwaggerDoc() {
    // base file: docs/openapi.yaml
    const result = loadYAML("openapi.yaml");

    // load components/*
    const compDir = path.join(__dirname, "..", "docs", "components");
    if (fs.existsSync(compDir)) {
        const files = fs.readdirSync(compDir).filter(f => f.endsWith(".yaml"));
        for (const file of files) {
            const part = loadYAML(`components/${file}`);
            deepMerge(result, part);
        }
    }

    // load paths/*
    //co-pilot {memperbaiki merging paths: mendukung file fragment top-level dan file yang mengekspor `paths` tanpa menimpa `result.paths`}
    const pathDir = path.join(__dirname, "..", "docs", "paths");
    if (fs.existsSync(pathDir)) {
        const files = fs.readdirSync(pathDir).filter(f => f.endsWith(".yaml"));
        result.paths = result.paths || {};

        for (const file of files) {
            const part = loadYAML(`paths/${file}`);

            // Support two formats:
            // 1) file exports full 'paths' object: { paths: { "/api/...": { ... } } }
            // 2) file exports top-level path fragments: { login: { post: ... }, ... }
            // Merge accordingly without overwriting existing result.paths
            if (part && typeof part === "object") {
                if (part.paths && typeof part.paths === "object") {
                    Object.assign(result.paths, part.paths);
                } else {
                    // top-level fragment: merge keys into paths
                    Object.assign(result.paths, part);
                }
            }
        }
    }

    logger.info("Swagger documentation merged successfully.");
    return result;
}

module.exports = { loadSwaggerDoc };