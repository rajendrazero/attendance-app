const app = require("./src/app");

function listRoutes(layer, base = "") {
    if (layer.route) {
        const path = base + layer.route.path;
        const methods = Object.keys(layer.route.methods)
            .join(", ")
            .toUpperCase();
        console.log(`${methods}  ${path}`);
    } else if (layer.name === "router" && layer.handle.stack) {
        layer.handle.stack.forEach(i =>
            listRoutes(i, base + (layer.regexp?.source === "^\\/" ? "" : ""))
        );
    } else if (layer.handle.stack) {
        layer.handle.stack.forEach(i => listRoutes(i, base));
    }
}

console.log("=== ROUTES LIST ===");
app._router.stack.forEach(i => listRoutes(i));
