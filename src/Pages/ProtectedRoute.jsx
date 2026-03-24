import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
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
        const q = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setIsAllowed(false);
          setLoading(false);
          return;
        }

        const userData = querySnapshot.docs[0].data();

        
        if (userData.role === allowedRole) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } catch (error) {
        console.error(error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [allowedRole]);

  if (loading) return null;

  if (!isAllowed) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

export default ProtectedRoute;