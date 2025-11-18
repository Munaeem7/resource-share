import React from "react";

const ResourceList = ({
  resources,
  onDownload,
  onDelete,
  onEdit,
  onView, 
  showActions = false,
  title = "Resources",
  emptyMessage = "No resources found.",
}) => {

  const safeResources = Array.isArray(resources) ? resources : [];

  // Handle loading state
  if (resources === undefined || resources === null) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading resources...</p>
      </div>
    );
  }

  // Handle error state (if resources is an error object)
  if (typeof resources === "object" && resources.error) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-red-900">
          Error loading resources
        </h3>
        <p className="mt-1 text-sm text-red-600">{resources.error}</p>
      </div>
    );
  }

  // If no resources, show empty message
  if (safeResources.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📭</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }


  return (
    <div className="resource-list">
      {/* Optional title */}
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}

      {/* Resources grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeResources.map((resource) => (
          <div
            key={resource._id || resource.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
          >
            {/* Resource header with category */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-b">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {resource.category || "Uncategorized"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {resource.downloadCount || 0} downloads
                  </span>
                </div>
              </div>
            </div>

            {/* Resource content */}
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 text-gray-800 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {resource.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {resource.subject}
                </span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {resource.fileType}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>By {resource.uploaderName}</span>
                <span>
                  {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>

              {/* Action buttons - ONLY VIEW BUTTON by default */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {/* Only show View Details button */}
                  <button
                    onClick={() => onView(resource)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200 flex items-center cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>
                </div>

                {/* Show edit/delete actions only if enabled (for user's own resources) */}
                {showActions && (
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(resource)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm cursor-pointer"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(resource._id || resource.id)}
                        className="text-red-600 hover:text-red-800 flex cursor-pointer items-center text-sm"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceList;