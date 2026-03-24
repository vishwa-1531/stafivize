import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const PublicRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setLoadingRole(true);

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            setRole(snap.data().role);
          } else {
            console.log("No user data");
          }
        } catch (error) {
          console.log(error);
        }

        setLoadingRole(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading...</div>;
  }


  if (user && loadingRole) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Checking role...</div>;
  }

  
  if (user) {
    if (role === "Admin") {
      return <Navigate to="/Dashboard" replace />;
    } else if (role === "Employee") {
      return <Navigate to="/EmployeeDashboard" replace />;
    } else {
      return <div>No role assigned</div>;
    }
  }

  return children;
};

export default PublicRoute;