import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  // If user is not authenticated, redirect to signin page
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;