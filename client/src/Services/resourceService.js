import { auth } from "../firebase/firebaseConfig";


const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const resourceService = {
  
  getResources: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both response formats:
      // 1. If API returns {success, count, resources} (your current format)
      // 2. If API returns direct array
      if (data && typeof data === 'object') {
        if (data.success && Array.isArray(data.resources)) {
          // Format 1: {success: true, resources: [...]}
          return data.resources;
        } else if (Array.isArray(data)) {
          // Format 2: [...] (direct array)
          return data;
        }
      }
      
      console.error("Unexpected API response format:", data);
      return []; // Return empty array for unexpected formats
    } catch (error) {
      console.error("Error fetching resources:", error);
      return []; // Return empty array on error
    }
  },

  // UPLOAD a new resource
  uploadResource: async (file, resourceData, token) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", resourceData.title);
    formData.append("description", resourceData.description);
    formData.append("subject", resourceData.subject);
    formData.append("category", resourceData.category);

    const response = await fetch(`${API_BASE_URL}/api/resources/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    return response.json();
  },

  // Increment download count - ENHANCED VERSION
incrementDownloadCount: async (resourceId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/resources/${resourceId}/download`,
      {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("Download count response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Download count error response:", errorText);
      
      // Try to parse JSON error, fallback to text
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Failed to update download count: ${response.status}`);
      } catch {
        throw new Error(`Failed to update download count: ${response.status} ${response.statusText}`);
      }
    }
    
    const result = await response.json();
    console.log("Download count updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error in incrementDownloadCount:", error);
    throw error; // Re-throw to handle in the component
  }
},

  // DELETE resource
  deleteResource: async (resourceId) => {
    // Get the current user's token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const token = await currentUser.getIdToken();

    const response = await fetch(
      `${API_BASE_URL}/api/resources/${resourceId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Delete failed");
    }

    return response.json();
  },
};

export default resourceService;