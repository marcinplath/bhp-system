import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default AdminRoute;
