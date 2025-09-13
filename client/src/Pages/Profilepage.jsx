import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  // Simple icons
  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const MailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const LogOutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Profile Settings</h1>
          <div className="flex items-center space-x-6">
            <div
              className={`flex items-center text-sm px-2 py-1 rounded-2xl ${
                isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
              {isOnline ? "Online" : "Offline"}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 cursor-pointer text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-sm"
            >
              <LogOutIcon />
              <span className="ml-1">Sign Out</span>
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-4 text-center">
              <div className="flex justify-center mb-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-26 w-26 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-26 w-26 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white border-4 border-white shadow-lg">
                    <UserIcon />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{displayName || "User"}</h2>
              <p className="text-sm text-gray-500">{email}</p>
            </div>

            {/* Tabs */}
            <nav className="bg-white rounded-xl shadow-md overflow-hidden">
              {[
                { id: "profile", label: "Profile", icon: <UserIcon /> },
                { id: "security", label: "Security", icon: <ShieldIcon /> },
                { id: "notifications", label: "Notifications", icon: <BellIcon /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full cursor-pointer px-5 py-4 text-left flex items-center transition ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span className="ml-3 font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <p className="mt-1 text-sm text-gray-500">Your account details</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <UserIcon />
                        <span className="ml-2 text-gray-800">{displayName || "Not available"}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MailIcon />
                        <span className="ml-2 text-gray-800">{email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
                <ShieldIcon />
                <h3 className="text-lg font-medium text-gray-900 mt-4">Security Features</h3>
                <p className="text-gray-500 mt-2">Currently unavailable. Coming soon.</p>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
                <BellIcon />
                <h3 className="text-lg font-medium text-gray-900 mt-4">Notification Settings</h3>
                <p className="text-gray-500 mt-2">Currently unavailable. Coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
