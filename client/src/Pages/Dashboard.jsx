import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import UploadForm from "../components/UploadForm";
import ResourceList from "../components/ResourceList";
import resourceService from "../Services/resourceService";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resources");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [resources, setResources] = useState([]);
  const [userResources, setUserResources] = useState([]);
  const [stats, setStats] = useState({
    downloads: 0,
    uploads: 0,
    reputation: 0,
    helpfulVotes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all resources
      const allResources = await resourceService.getResources();

      // Ensure allResources is an array
      if (!Array.isArray(allResources)) {
        console.error("Expected array but got:", allResources);
        setResources([]);
        setUserResources([]);
        return;
      }

      setResources(allResources);

      // Filter user's resources
      const userResourcesData = allResources.filter(
        (resource) => resource.uploaderId === user.uid
      );
      setUserResources(userResourcesData);

      // Calculate stats
      const totalDownloads = userResourcesData.reduce(
        (sum, resource) => sum + (resource.downloadCount || 0),
        0
      );

      setStats({
        downloads: totalDownloads,
        uploads: userResourcesData.length,
        reputation: userResourcesData.length * 25,
        helpfulVotes: Math.floor(totalDownloads * 0.3),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty arrays to prevent further errors
      setResources([]);
      setUserResources([]);
    }
    setIsLoading(false);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchData(); // Refresh data after upload
  };

  const handleDownload = async (resource) => {
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
      // Infer extension from fileUrl or type (optional enhancement)
      if (resource.fileUrl.endsWith('.pdf')) downloadName += '.pdf';
      else if (resource.fileUrl.endsWith('.docx')) downloadName += '.docx';
      // Add more if needed for images, etc.
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
      fetchData();
    }, 1000);
  } catch (error) {
    console.error("Download error:", error);

    // Fallback: Correctly add fl_attachment to Cloudinary URL and open in new tab
    try {
      let downloadUrl = addAttachmentToCloudinaryUrl(resource.fileUrl); // Use helper function below
      window.open(downloadUrl, "_blank");
      console.log("Opened fallback download in new tab with corrected URL");
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      alert(`Error downloading file. Please try the direct link: ${resource.fileUrl}`);
    }
  }
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

  const handleDeleteResource = async (resourceId) => {
    try {
      if (window.confirm("Are you sure you want to delete this resource?")) {
        await resourceService.deleteResource(resourceId);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Error deleting resource");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome, {user?.displayName || user?.email} 👋
              </h1>
              <p className="text-blue-100 mt-2">
                Here's what's happening in your academic community
              </p>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="mt-4 cursor-pointer md:mt-0 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition duration-200"
            >
              {showUploadForm ? "Cancel Upload" : "Upload New Resource"}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="max-w-4xl mx-auto px-6 py-6">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Downloads Card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Downloads</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.downloads}
              </p>
            </div>
          </div>

          {/* Uploads Card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 010 8h-1.1"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Your Uploads</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.uploads}
              </p>
            </div>
          </div>

          {/* Reputation Card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Reputation</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.reputation}
              </p>
            </div>
          </div>

          {/* Helpful Votes Card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Helpful Votes</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.helpfulVotes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === "resources"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("resources")}
            >
              Community Resources
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === "myResources"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("myResources")}
            >
              My Resources
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === "recent"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("recent")}
            >
              Recent Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "resources" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Community Resources
                </h2>
                {resources.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No resources yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Be the first to upload a study resource!
                    </p>
                  </div>
                ) : (
                  <ResourceList
                    resources={resources}
                    onDownload={handleDownload}
                    showActions={false}
                  />
                )}
              </div>
            )}

            {activeTab === "myResources" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Your Uploaded Resources
                </h2>
                {userResources.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No resources
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by uploading your first study resource.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Upload Resource
                      </button>
                    </div>
                  </div>
                ) : (
                  <ResourceList
                    resources={userResources}
                    onDownload={handleDownload}
                    onDelete={handleDeleteResource}
                    showActions={true}
                  />
                )}
              </div>
            )}

            {activeTab === "recent" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">
                        You downloaded "Calculus I Complete Notes"
                      </p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-green-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full mr-4">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 10h4.764a2 2 极 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">
                        Your resource received 5 helpful votes
                      </p>
                      <p className="text-sm text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
