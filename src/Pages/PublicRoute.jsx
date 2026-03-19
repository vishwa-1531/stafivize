import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // ✅ FIX: show loading instead of null
  if (user === undefined) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading...</div>;
  }

  if (user) {
    const selectedRole = sessionStorage.getItem("selectedRole");

    if (selectedRole === "Admin") {
      return <Navigate to="/Dashboard" replace />;
    } else if (selectedRole === "Employee") {
      return <Navigate to="/EmployeeDashboard" replace />;
    }
  }

  return children;
};
export default PublicRoute;