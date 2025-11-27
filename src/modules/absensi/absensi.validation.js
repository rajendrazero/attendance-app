// src/modules/absensi/absensi.validation.js

const validateInputAbsensi = (data) => {
    const errors = [];

    if (!data.student_id)
        errors.push({ field: "student_id", message: "student_id wajib" });

    if (!data.tanggal)
        errors.push({ field: "tanggal", message: "tanggal wajib" });

    if (!data.status)
        errors.push({ field: "status", message: "status wajib" });

    const allowedStatus = ["hadir", "sakit", "izin", "tanpa_keterangan"];
    if (data.status && !allowedStatus.includes(data.status)) {
        errors.push({
            field: "status",
            message: `Status harus salah satu dari: ${allowedStatus.join(", ")}`,
        });
    }

    return errors;
};

module.exports = { validateInputAbsensi };