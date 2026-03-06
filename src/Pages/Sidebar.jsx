import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
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

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

import { onAuthStateChanged } from "firebase/auth";

const Sidebar = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("");

  // =========================
  // Get initials
  // =========================
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  };

  // =========================
  // Avatar color generator
  // =========================
  const getAvatarColor = (name) => {
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4"
    ];
    if (!name) return colors[0];
    let charCodeSum = 0;
    for (let i = 0; i < name.length; i++) charCodeSum += name.charCodeAt(i);
    return colors[charCodeSum % colors.length];
  };

  // =========================
  // Fetch user data
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserName(`${data.firstName || ""} ${data.lastName || ""}`.trim());
            setProfileImage(data.profileImage || null);
          }
        } catch (error) {
          console.log("Fetch user error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // =========================
  // Upload profile image
  // =========================
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);

      // Delete old image if exists
      if (profileImage) {
        try {
          const oldImageRef = ref(storage, profileImage);
          await deleteObject(oldImageRef);
        } catch (err) {
          console.log("Old image not found or already deleted.");
        }
      }

      // Upload new image with timestamp to prevent overwrites
      const imageRef = ref(storage, `profileImages/${user.uid}_${Date.now()}`);
      await uploadBytes(imageRef, file);

      const downloadURL = await getDownloadURL(imageRef);

      // Save URL in Firestore
      await setDoc(
        userRef,
        { profileImage: downloadURL },
        { merge: true }
      );

      setProfileImage(downloadURL);
    } catch (error) {
      console.log("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <div className="sidebar">
      {/* ================= Logo ================= */}
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      {/* ================= Menu ================= */}
      <ul className="sidebar-menu">
        <NavLink to="/Dashboard" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaThLarge className="menu-icon" /> Dashboard
        </NavLink>

        <NavLink to="/Employee" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaUsers className="menu-icon" /> Employees
        </NavLink>

        <NavLink to="/Attendance" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaCalendarCheck className="menu-icon" /> Attendance
        </NavLink>

        <NavLink to="/Leave" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaCalendarAlt className="menu-icon" /> Leave
        </NavLink>

        <NavLink to="/Payroll" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaWallet className="menu-icon" /> Payroll
        </NavLink>

        <NavLink to="/Report" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaChartBar className="menu-icon" /> Reports
        </NavLink>

        <NavLink to="/Login" end className={({ isActive }) => isActive ? "logout-item active" : "logout-item"}>
          <FaSignOutAlt className="menu-icon" /> LogOut
        </NavLink>
      </ul>

      {/* ================= Profile Section ================= */}
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
            <div className="profile-initials" style={{ backgroundColor: getAvatarColor(userName) }}>
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