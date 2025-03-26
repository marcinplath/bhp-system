import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children, redirectTo = "/" }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (user) {
    return <Navigate to={redirectTo} />;
  }

  return children;
};

export default PublicRoute;
