module.exports = {
    apps: [
        {
            name: "attendance-app",
            script: "src/server.js",
            instances: "max", // pakai semua core CPU
            exec_mode: "cluster", // cluster mode
            watch: false, // production TIDAK perlu watch
            max_memory_restart: "500M", // restart otomatis jika RAM bocor
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};
