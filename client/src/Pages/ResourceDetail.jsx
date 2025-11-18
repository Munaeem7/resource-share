// pages/ResourceDetail.jsx - FIXED VERSION WITH PROPER DOWNLOAD
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import resourceService from "../Services/resourceService";

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    if (id) {
      fetchResourceDetails();
    }
  }, [id]);

  const fetchResourceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const resourceData = await resourceService.getResourceById(id);
      
      if (!resourceData) {
        throw new Error('No resource data returned');
      }
      
      setResource(resourceData);
      
    } catch (error) {
      console.error("Error fetching resource:", error);
      setError("Resource not found or failed to load");
    } finally {
      setIsLoading(false);
    }
  };

  const canOpenInNewTab = (fileType) => {
    const type = fileType?.toLowerCase();
    const openableTypes = ['image', 'txt', 'html', 'htm'];
    return openableTypes.some(openable => type?.includes(openable));
  };

  // Helper function to correctly add fl_attachment to Cloudinary URL
  const addAttachmentToCloudinaryUrl = (url) => {
    if (!url.includes("cloudinary.com")) {
      return url; // Not Cloudinary; return as-is
    }

    // Find the position after '/upload/' or '/raw/' (common for non-images)
    const uploadIndex = url.indexOf('/upload/');
    const rawIndex = url.indexOf('/raw/'); // For raw resources like DOCX/PDF

    if (uploadIndex !== -1) {
      // Insert /fl_attachment/ after /upload/
      return url.slice(0, uploadIndex + 8) + 'fl_attachment/' + url.slice(uploadIndex + 8);
    } else if (rawIndex !== -1) {
      // Insert /fl_attachment/ after /raw/ (assuming /raw/upload/ structure)
      const adjustedIndex = url.indexOf('/upload/', rawIndex);
      if (adjustedIndex !== -1) {
        return url.slice(0, adjustedIndex + 8) + 'fl_attachment/' + url.slice(adjustedIndex + 8);
      } else {
        // Fallback for /raw/ without /upload/
        return url.slice(0, rawIndex + 5) + 'fl_attachment/' + url.slice(rawIndex + 5);
      }
    }

    // If no match, append as best-effort (rare case)
    return url.replace(/\/v\d+\//, '/fl_attachment/v$&'); // Insert before version
  };

  const handleDownload = async () => {
    if (!resource) return;
    
    try {
      console.log("Starting download for:", resource.fileName);

      // 1. Increment download count (fire and forget)
      resourceService
        .incrementDownloadCount(resource._id)
        .then(() => console.log("Download count updated"))
        .catch((err) => console.warn("Download count update failed:", err));

      // 2. Fetch the file
      const response = await fetch(resource.fileUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      // 3. Get the original blob
      const originalBlob = await response.blob();

      // 4. Create a new blob with forced octet-stream type to prevent browser preview (fixes PDF issue)
      const forceDownloadBlob = new Blob([originalBlob], { type: 'application/octet-stream' });

      // 5. Create blob URL
      const blobUrl = window.URL.createObjectURL(forceDownloadBlob);

      // 6. Create download link (ensure filename has extension for correct saving)
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Use resource.fileName if it includes extension; fallback to title + inferred ext
      let downloadName = resource.fileName || resource.title || "download";
      if (!downloadName.includes('.')) {
        // Infer extension from fileUrl or type
        if (resource.fileUrl.endsWith('.pdf')) downloadName += '.pdf';
        else if (resource.fileUrl.endsWith('.docx')) downloadName += '.docx';
        else if (resource.fileUrl.endsWith('.doc')) downloadName += '.doc';
        else if (resource.fileUrl.endsWith('.ppt')) downloadName += '.ppt';
        else if (resource.fileUrl.endsWith('.pptx')) downloadName += '.pptx';
        else if (resource.fileUrl.endsWith('.xls')) downloadName += '.xls';
        else if (resource.fileUrl.endsWith('.xlsx')) downloadName += '.xlsx';
        else if (resource.fileUrl.endsWith('.zip')) downloadName += '.zip';
        else if (resource.fileUrl.endsWith('.rar')) downloadName += '.rar';
        else if (resource.fileUrl.endsWith('.jpg') || resource.fileUrl.endsWith('.jpeg')) downloadName += '.jpg';
        else if (resource.fileUrl.endsWith('.png')) downloadName += '.png';
        else if (resource.fileUrl.endsWith('.gif')) downloadName += '.gif';
        else if (resource.fileUrl.endsWith('.txt')) downloadName += '.txt';
        // Add more extensions as needed
      }
      
      link.download = downloadName;
      link.style.display = "none";

      // 7. Trigger download
      document.body.appendChild(link);
      link.click();

      // 8. Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        console.log("Download completed and cleaned up");
      }, 100);

      // 9. Refresh data
      setTimeout(() => {
        fetchResourceDetails();
      }, 1000);
      
    } catch (error) {
      console.error("Download error:", error);

      // Fallback: Correctly add fl_attachment to Cloudinary URL and open in new tab
      try {
        let downloadUrl = addAttachmentToCloudinaryUrl(resource.fileUrl);
        window.open(downloadUrl, "_blank");
        console.log("Opened fallback download in new tab with corrected URL");
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert(`Error downloading file. Please try the direct link: ${resource.fileUrl}`);
      }
    }
  };

  const handleOpenInNewTab = () => {
    if (!resource) return;
    window.open(resource.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase();
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('doc') || type?.includes('word')) return '📝';
    if (type?.includes('ppt') || type?.includes('powerpoint')) return '📊';
    if (type?.includes('xls') || type?.includes('excel')) return '📈';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('zip') || type?.includes('rar')) return '🗜️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderPreview = () => {
    if (!resource) return null;

    const fileType = resource.fileType?.toLowerCase();
    
    if (fileType?.includes('pdf')) {
      return (
        <div className="w-full bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">PDF Document</h3>
          <p className="text-gray-600 mb-6">This PDF file can't be viewed directly in your browser</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      );
    }
    
    if (fileType?.includes('image')) {
      return (
        <div className="w-full flex justify-center">
          <img 
            src={resource.fileUrl} 
            alt={resource.title}
            className="max-w-full max-h-96 rounded-lg shadow-md object-contain border"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-gray-600 mb-4">Image preview not available</p>
            <button
              onClick={handleOpenInNewTab}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Image
            </button>
          </div>
        </div>
      );
    }

    // For other file types
    return (
      <div className="w-full bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <div className="text-6xl mb-4">{getFileIcon(resource.fileType)}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {resource.fileType || 'File'} Document
        </h3>
        <p className="text-gray-600 mb-6">
          {canOpenInNewTab(resource.fileType) 
            ? "This file can be opened in a new tab for viewing"
            : "This file type is best accessed by downloading"
          }
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Download File
          </button>
          {canOpenInNewTab(resource.fileType) && (
            <button
              onClick={handleOpenInNewTab}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Open in New Tab
            </button>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resource Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The resource you're looking for doesn't exist."}</p>
          <Link 
            to="/dashboard" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="text-sm text-gray-500">
              Resources / {resource.category} / {resource.subject}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - FIXED TEXT OVERFLOW */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              {/* File Icon & Basic Info - FIXED LONG TITLES */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{getFileIcon(resource.fileType)}</div>
                <h3 
                  className="font-semibold text-gray-900 mb-2 break-words line-clamp-3 leading-tight"
                  title={resource.title}
                >
                  {resource.title}
                </h3>
                <p className="text-gray-600 text-sm break-words">
                  {truncateText(resource.subject, 20)} • {truncateText(resource.category, 15)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>

                {canOpenInNewTab(resource.fileType) && (
                  <button
                    onClick={handleOpenInNewTab}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </button>
                )}
              </div>

              {/* File Information - FIXED LONG TEXT HANDLING */}
              <div className="border-t pt-6 mt-6 space-y-4">
                <h4 className="font-semibold text-gray-900">File Information</h4>
                
                <div className="space-y-3">
                  {/* File Type */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 text-sm flex-shrink-0">File Type</span>
                    <span 
                      className="font-medium text-sm text-gray-900 break-words text-right max-w-[60%]"
                      title={resource.fileType}
                    >
                      {truncateText(resource.fileType, 20)}
                    </span>
                  </div>

                  {/* File Size */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">File Size</span>
                    <span className="font-medium text-sm text-gray-900">
                      {formatFileSize(resource.fileSize)}
                    </span>
                  </div>

                  {/* Downloads */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Downloads</span>
                    <span className="font-medium text-sm text-gray-900">
                      {resource.downloadCount || 0}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 text-sm">Uploaded</span>
                    <span className="font-medium text-sm text-gray-900 text-right">
                      {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>

                  {/* Uploaded By - FIXED LONG NAMES */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 text-sm flex-shrink-0">Uploaded by</span>
                    <span 
                      className="font-medium text-sm text-gray-900 break-words text-right max-w-[60%]"
                      title={resource.uploaderName}
                    >
                      {truncateText(resource.uploaderName, 20)}
                    </span>
                  </div>
                </div>
              </div>

              {/* File Name - Only if different from title - FIXED LONG FILENAMES */}
              {resource.fileName && resource.fileName !== resource.title && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">File Name</h4>
                  <p 
                    className="text-sm text-gray-700 break-words bg-gray-50 p-3 rounded-lg overflow-hidden"
                    title={resource.fileName}
                  >
                    {resource.fileName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Resource Header */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  {resource.category}
                </span>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                  {resource.subject}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4 break-words">{resource.title}</h1>
              <p className="text-gray-700 leading-relaxed break-words">{resource.description}</p>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="border-b">
                <div className="flex">
                  <button
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "preview"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("preview")}
                  >
                    Preview
                  </button>
                  <button
                    className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "details"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'preview' && (
                  <div>
                    {renderPreview()}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">File Information</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">File Name</dt>
                          <dd className="font-medium break-words text-right max-w-[60%]">
                            {resource.fileName}
                          </dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">File Type</dt>
                          <dd className="font-medium">{resource.fileType}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">File Size</dt>
                          <dd className="font-medium">{formatFileSize(resource.fileSize)}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">Upload Date</dt>
                          <dd className="font-medium">
                            {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Unknown'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4"> Information</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">Subject</dt>
                          <dd className="font-medium">{resource.subject}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">Category</dt>
                          <dd className="font-medium">{resource.category}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">Total Downloads</dt>
                          <dd className="font-medium">{resource.downloadCount || 0}</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <dt className="text-gray-600">Uploaded by</dt>
                          <dd className="font-medium break-words text-right max-w-[60%]">
                            {resource.uploaderName}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;