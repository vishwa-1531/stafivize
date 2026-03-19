import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const selectedRole = sessionStorage.getItem("selectedRole");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setIsAllowed(false);
          setLoading(false);
          return;
        }

        const userData = userSnap.data();

        // ✅ SAFE CHECK (NO LOOP ISSUE)
        if (
          userData.role === allowedRole &&
          selectedRole &&
          selectedRole === allowedRole
        ) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        console.error("ProtectedRoute error:", error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [allowedRole]);

  // ⏳ While checking → show nothing (or loader)
  if (loading) {
    return null;
  }

  // ❗ IMPORTANT FIX: prevent loop
  if (!isAllowed) {
    return <Navigate to="/Login" replace state={{ fromProtected: true }} />;
  }

  return children;
};

export default ProtectedRoute;