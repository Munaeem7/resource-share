import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileDropdownRef = useRef(null);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Professional User Icon Component
  const UserIcon = ({ className = "w-5 h-5" }) => (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fillRule="evenodd" 
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
        clipRule="evenodd" 
      />
    </svg>
  );

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-white flex items-center">
              <svg className="w-8 h-8 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l-9 5m9-5v6"></path>
              </svg>
              StudyShare
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              Contact
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? "bg-blue-700 text-white" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                
                {/* Profile Dropdown */}
                <div className="relative ml-3" ref={profileDropdownRef}>
                  <div>
                    <button
                      type="button"
                      className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer focus:ring-white transition-all duration-200 hover:ring-2 hover:ring-gray-600"
                      onClick={toggleProfileDropdown}
                      aria-expanded={isProfileDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user.photoURL ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={user.photoURL}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-inner">
                          {/* Fixed condition: Show icon if no user data available, otherwise show initials */}
                          {!user?.displayName && !user?.email ? (
                            <UserIcon className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-sm font-medium">
                              {getUserInitials()}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Profile Dropdown Menu */}
                  <div
                    className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ease-out z-50 ${
                      isProfileDropdownOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-900 font-medium">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Your Profile
                        </div>
                      </Link>


                      <button
                        onClick={handleLogout}
                        className="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-2 ml-4">
                <NavLink to="/signin">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-gray-300 rounded-md hover:bg-gray-700 transition-colors duration-200">
                    Sign In
                  </button>
                </NavLink>
                
                <NavLink to="/signup">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200">
                    Sign Up
                  </button>
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </NavLink>
            
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive 
                        ? "bg-blue-700 text-white" 
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      {user.photoURL ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.photoURL}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-inner">
                          {/* Fixed condition for mobile as well */}
                          {!user?.displayName && !user?.email ? (
                            <UserIcon className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-lg font-medium">
                              {getUserInitials()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-sm font-medium text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex flex-col space-y-2 px-2">
                  <NavLink 
                    to="/signin" 
                    className="w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className="w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </NavLink>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
