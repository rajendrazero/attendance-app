const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Upload dengan folder dinamis
 * Contoh:
 * uploadTo("data-siswa").single("file")
 * uploadTo("bukti").single("foto")
 */
function uploadTo(folderName) {
    const fullPath = path.join("uploads", folderName);

    // Pastikan folder ada
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, fullPath);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, Date.now() + "-" + file.fieldname + ext);
        }
    });

    return multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB
    });
}

module.exports = uploadTo;