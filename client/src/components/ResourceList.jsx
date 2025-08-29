import React from "react";

// ResourceList Component - displays a list of resources
const ResourceList = ({ 
  resources, 
  onDownload, 
  onDelete, 
  onEdit, 
  showActions = false,
  title = "Resources",
  emptyMessage = "No resources found." 
}) => {
  // Ensure resources is always an array to prevent .map() errors
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
  if (typeof resources === 'object' && resources.error) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-red-900">Error loading resources</h3>
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
          <div key={resource._id || resource.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Resource header with category */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 border-b">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {resource.category || 'Uncategorized'}
                </span>
                {resource.averageRating && (
                  <span className="flex items-center text-yellow-500 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-极.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.极h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    {resource.averageRating}
                  </span>
                )}
              </div>
            </div>
            
            {/* Resource content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
                {resource.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {resource.description || 'No description provided.'}
              </p>
              
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
                <span>{resource.downloadCount || 0} downloads</span>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => onDownload(resource)}
                  className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download
                </button>
                
                {/* Show edit/delete actions only if enabled */}
                {showActions && (
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(resource)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 极 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(resource._id || resource.id)}
                        className="text-red-600 hover:text-red-800 flex cursor-pointer items-center text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" view极="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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