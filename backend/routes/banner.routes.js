const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const ctrl       = require("../controllers/banner/banner.controller");
const { requirePermission } = require("../middlewares/permission.middleware");
const { safeFilename } = require("../utils/safe-upload");

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/banner"),
  filename:    safeFilename,
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 }, // 300 KB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Formato inválido"));
  },
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ message: "La imagen no puede superar 300 KB" });
    return res.status(400).json({ message: "Formato inválido. Solo jpg, png o webp" });
  }
  next(err);
};

router.get("/public",        ctrl.publicBanners);
router.get("/all",           requirePermission("banners.view"),   ctrl.allBanners);
router.post("/create",       requirePermission("banners.create"), upload.single("image"), handleUploadError, ctrl.createBanner);
router.put("/update/:id",    requirePermission("banners.update"), upload.single("image"), handleUploadError, ctrl.updateBanner);
router.delete("/delete/:id", requirePermission("banners.delete"), ctrl.deleteBanner);

module.exports = router;
