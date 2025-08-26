import multer from 'multer'; 
import upload from "./upload.js";

const uploadWithErrorHandling = (req, res, next) => {
  upload.single("file")(req, res, function(err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: "Too many files. Maximum is 1 file" });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: "Unexpected file field" });
        }
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

export default uploadWithErrorHandling;