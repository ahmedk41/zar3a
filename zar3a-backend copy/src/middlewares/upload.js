// src/middlewares/upload.js
import multer from "multer";
import path   from "path";
import fs     from "fs";
import { v4 as uuidv4 } from "uuid";

const uploadDir = process.env.CV_UPLOAD_DIR || "uploads/cv";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file,  cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const fileFilter = (_req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  if (allowed.includes(path.extname(file.originalname).toLowerCase()))
    cb(null, true);
  else
    cb(new Error("Only PDF and Word documents are accepted for CV upload"));
};

export const uploadCV = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single("cv");
