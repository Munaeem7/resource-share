import multer from 'multer';
import  ClamScan  from 'clamav.js';

// Memory storage for initial scan (max 50MB)
const memoryStorage = multer.memoryStorage({
  limits: { fileSize: 50 * 1024 * 1024 },
});

const memoryUpload = multer({ storage: memoryStorage });

// Initialize ClamAV
let clamavAvailable = false;
let clamScanner;

(async () => {
  try {
    clamScanner = new ClamScan({
      host: process.env.CLAMAV_HOST || 'localhost',
      port: parseInt(process.env.CLAMAV_PORT) || 3310,
      timeout: 30000,
    });

    await clamScanner.ping();
    clamavAvailable = true;
    console.log('✅ ClamAV antivirus connected successfully');
  } catch (error) {
    console.error('❌ ClamAV not available:', error.message);
    clamavAvailable = false;
  }
})();

export const preUploadScan = (req, res, next) => {
  // First, upload to memory for scanning
  memoryUpload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Scan file with ClamAV if available
    try {
      if (clamavAvailable) {
        console.log(`Scanning file: ${req.file.originalname}`);
        const result = await clamScanner.scanBuffer(req.file.buffer);

        if (result.isInfected) {
          return res.status(400).json({
            success: false,
            error: 'File contains malware and was rejected',
            details: result.viruses,
          });
        }

        console.log(`✅ File ${req.file.originalname} passed virus scan`);
        req.scannedFile = req.file; // Store for next middleware
      } else {
        console.warn('⚠️ ClamAV not available, skipping scan');
        req.scannedFile = req.file; // Proceed without scan
      }

      next();
    } catch (scanError) {
      console.error('❌ Virus scan error:', scanError);
      return res.status(500).json({
        success: false,
        error: 'Failed to scan file for viruses',
      });
    }
  });
};