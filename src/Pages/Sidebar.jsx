// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../css/Sidebar.css";
import logo from "../image/logo.png";

import {
  FaThLarge,
  FaUsers,
  FaCalendarCheck,
  FaCalendarAlt,
  FaWallet,
  FaChartBar,
  FaSignOutAlt
} from "react-icons/fa";

import { auth, db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const Sidebar = () => {
  const location = useLocation();

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePath, setProfileImagePath] = useState(null);
  const [userName, setUserName] = useState("");

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    if (!name) return colors[0];
    let charCodeSum = 0;
    for (let i = 0; i < name.length; i++) charCodeSum += name.charCodeAt(i);
    return colors[charCodeSum % colors.length];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          let userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            await setDoc(userRef, {
              firstName: user.displayName?.split(" ")[0] || "",
              lastName: user.displayName?.split(" ")[1] || "",
              email: user.email || "",
              profileImage: "",
              profileImagePath: "",
              createdAt: new Date()
            });
            userSnap = await getDoc(userRef);
          }

          const data = userSnap.data();
          setUserName(`${data.firstName || ""} ${data.lastName || ""}`.trim());
          setProfileImage(data.profileImage || null);
          setProfileImagePath(data.profileImagePath || null);
        } catch (error) {
          console.error("Fetch/create user error:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      if (profileImagePath) {
        try {
          const oldImageRef = ref(storage, profileImagePath);
          await deleteObject(oldImageRef);
        } catch (err) {
          console.log("Old image not found or already deleted.");
        }
      }

      const imageRef = ref(storage, `profileImages/${user.uid}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      await setDoc(
        userRef,
        {
          profileImage: downloadURL,
          profileImagePath: imageRef.fullPath
        },
        { merge: true }
      );

      setProfileImage(downloadURL);
      setProfileImagePath(imageRef.fullPath);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const employeeActive =
    location.pathname === "/Employee" ||
    location.pathname.startsWith("/employee-profile");

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      <ul className="sidebar-menu">
        <NavLink
          to="/Dashboard"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaThLarge className="menu-icon" /> Dashboard
        </NavLink>

        <NavLink
          to="/Employee"
          className={employeeActive ? "nav-item active" : "nav-item"}
        >
          <FaUsers className="menu-icon" /> Employees
        </NavLink>

        <NavLink
          to="/Attendance"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaCalendarCheck className="menu-icon" /> Attendance
        </NavLink>

        <NavLink
          to="/Leave"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaCalendarAlt className="menu-icon" /> Leave
        </NavLink>

        <NavLink
          to="/Payroll"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaWallet className="menu-icon" /> Payroll
        </NavLink>

        <NavLink
          to="/Report"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaChartBar className="menu-icon" /> Reports
        </NavLink>

        <NavLink
          to="/Login"
          className={({ isActive }) => (isActive ? "logout-item active" : "logout-item")}
        >
          <FaSignOutAlt className="menu-icon" /> LogOut
        </NavLink>
      </ul>

      <div className="sidebar-profile">
        <label htmlFor="profileUpload">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="profile-img"
              onError={() => setProfileImage(null)}
            />
          ) : (
            <div
              className="profile-initials"
              style={{ backgroundColor: getAvatarColor(userName) }}
            >
              {getInitials(userName)}
            </div>
          )}
        </label>

        <input
          type="file"
          id="profileUpload"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />

        <div>
          <h4>{userName || "Loading..."}</h4>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;