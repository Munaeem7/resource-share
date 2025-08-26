import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import resourceService from "../Services/resourceService";

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("notes");
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  // Add this function to format file sizes
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ validations
    if (!file || !title || !subject) {
      alert("⚠️ Please fill all required fields");
      return;
    }
    
    // Increased size limit for compressed files
    if (file.size > 50 * 1024 * 1024) {
      alert("⚠️ File size must be less than 50MB");
      return;
    }

    setIsUploading(true);
    try {
      // Get Firebase token first
      const token = await user.getIdToken();
      
      await resourceService.uploadResource(
        file,
        { title, description, subject, category },
        token
      );

      // ✅ reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setSubject("");
      setCategory("notes");

      if (onUploadSuccess) onUploadSuccess();
      alert("✅ Resource uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Error uploading resource: " + (error.message || "Unknown error"));
    }
    setIsUploading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
        📚 Upload Study Resource
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File *
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-3 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 极 24 24"
              >
                <path d="M7 16V4m0 0l-4 4m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400">
                ZIP, PDF, DOCX, TXT, JPG, PNG (Max 50MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
            />
          </label>
          {file && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              ✅ {file.name} ({formatFileSize(file.size)})
              {file.name.match(/\.(zip|rar|7z|tar|gz)$/i) && (
                <span className="text-blue-500 ml-2">📦 Compressed folder</span>
              )}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Calculus I Complete Notes"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Mathematics, Physics"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="notes">📝 Notes</option>
            <option value="assignment">📄 Assignment</option>
            <option value="project">💻 Project</option>
            <option value="past-paper">📑 Past Paper</option>
            <option value="book">📘 Book</option>
            <option value="cheatsheet">⚡ Cheat Sheet</option>
            <option value="software">📦 Software/Archive</option>
            <option value="other">📂 Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="block w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe what this resource contains..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center font-medium"
        >
          {isUploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            "🚀 Upload Resource"
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;