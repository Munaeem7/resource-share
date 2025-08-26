import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["notes", "assignment", "project", "past-paper", "book", "cheatsheet", "other"]
  },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploaderId: { type: String, required: true },
  uploaderName: { type: String, required: true },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Resource", resourceSchema);