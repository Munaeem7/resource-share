import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Dynamically determine resource_type based on MIME type
    let resourceType = 'image'; // Default for images
    if (file.mimetype.startsWith('application/')) {
      if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/plain'
      ) {
        resourceType = 'raw'; // Use 'raw' for PDFs, DOCX, DOC, and TXT
      }
    }

    return {
      folder: 'resources', // Folder in Cloudinary
      resource_type: resourceType,
      public_id: file.originalname.replace(/\.[^/.]+$/, ''), // Remove extension for cleaner URLs
    };
  },
});

// Create multer instance with limits and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow certain file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${file.mimetype} is not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, TXT`
        ),
        false
      );
    }
  },
});

export default upload;