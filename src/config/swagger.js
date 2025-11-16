const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Attendance App API",
            version: "1.0.0",
            description: "Dokumentasi API sistem absensi sekolah",
        },

        servers: [
            { url: "http://localhost:3000" }
        ],

        // >>> SECURITY DEFINITIONS ADA DI SINI <<<
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    // Auto scan semua routes & controller
    apis: [
        "./src/modules/**/**/*.routes.js",
        "./src/modules/**/**/*.controller.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };