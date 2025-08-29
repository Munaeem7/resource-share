import express from "express";
import Resource from "../models/Resource.js";
import verifyToken from "../middleware/authMiddleware.js";
import uploadWithErrorHandling from "../middleware/uploadWithErrorHandling.js";
import { getAuth } from "firebase-admin/auth";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// POST /api/resources/upload - Upload a new resource
router.post("/upload", uploadWithErrorHandling, async (req, res) => {
  try {
    console.log("Upload request received");
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    // Verify Firebase token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Unauthorized - No authentication token provided" 
      });
    }

    let decoded;
    try {
      decoded = await getAuth().verifyIdToken(token);
      console.log("Token verified for user:", decoded.uid);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return res.status(401).json({ 
        success: false,
        error: "Invalid authentication token" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded or file validation failed" 
      });
    }

    // Validate required fields
    if (!req.body.title || !req.body.subject) {
      // Clean up the uploaded file since validation failed
      if (req.file.filename) {
        try {
          await cloudinary.uploader.destroy(req.file.filename);
          console.log("Cleaned up file due to validation failure");
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      }
      
      return res.status(400).json({ 
        success: false,
        error: "Title and subject are required fields" 
      });
    }

    // Save to MongoDB
    const newResource = new Resource({
      title: req.body.title,
      description: req.body.description || "",
      subject: req.body.subject,
      category: req.body.category || "notes",
      fileUrl: req.file.path, 
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploaderId: decoded.uid,
      uploaderName: decoded.name || decoded.email,
      cloudinaryId: req.file.filename, 
    });

    await newResource.save();
    console.log("Resource saved successfully with ID:", newResource._id);
    
    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      resource: {
        id: newResource._id,
        title: newResource.title,
        fileUrl: newResource.fileUrl,
        createdAt: newResource.createdAt
      }
    });

  } catch (error) {
    console.error("Upload error details:", error);
    
    // If something fails after Cloudinary upload, clean up the file
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
        console.log("Cleaned up uploaded file from Cloudinary due to error");
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    
    // Handle different types of errors
    let errorMessage = "Upload failed";
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.name === 'MongoError' && error.code === 11000) {
      errorMessage = "Duplicate resource detected";
      statusCode = 409;
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/resources - Get all resources
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch resources" 
    });
  }
});

// GET /api/resources/:id - Get single resource
router.get("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ 
        success: false,
        error: "Resource not found" 
      });
    }
    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch resource" 
    });
  }
});

// PUT /api/resources/:id/download - Increment download count
router.put("/:id/download", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    
    if (!resource) {
      return res.status(404).json({ 
        success: false,
        error: "Resource not found" 
      });
    }
    
    res.json({
      success: true,
      downloadCount: resource.downloadCount,
      resource
    });
  } catch (error) {
    console.error("Error updating download count:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to update download count" 
    });
  }
});

// GET /api/resources/:id/download-url - Get download URL for a resource
router.get('/:id/download-url', verifyToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
      });
    }

    const downloadUrl = addAttachmentToCloudinaryUrl(resource.fileUrl);

    res.json({
      success: true,
      downloadUrl,
      fileName: resource.fileName,
      fileType: resource.fileType,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate download URL',
    });
  }
});

// DELETE /api/resources/:id - Delete resource
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ 
        success: false,
        error: "Resource not found" 
      });
    }
    
    // Check if user owns the resource
    if (resource.uploaderId !== req.user.uid) {
      return res.status(403).json({ 
        success: false,
        error: "Not authorized to delete this resource" 
      });
    }
    
    // Delete from Cloudinary first
    if (resource.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(resource.cloudinaryId);
        console.log("Deleted file from Cloudinary:", resource.cloudinaryId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with MongoDB deletion even if Cloudinary deletion fails
      }
    }
    
    // Delete from MongoDB
    await Resource.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: "Resource deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete resource" 
    });
  }
});

// Helper function to add fl_attachment
const addAttachmentToCloudinaryUrl = (url) => {
  if (!url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/fl_attachment/${parts[1]}`;
  }

  const rawParts = url.split('/raw/');
  if (rawParts.length === 2) {
    return `${rawParts[0]}/raw/fl_attachment/${rawParts[1]}`;
  }

  return url; // Fallback
};

export default router;