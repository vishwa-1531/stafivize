import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [uploading, setUploading] = useState(false);

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ").filter(Boolean);

      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }

      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
    }

    if (email) {
      return email.slice(0, 2).toUpperCase();
    }

    return "US";
  };

  const getAvatarColor = (text) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    if (!text) return colors[0];

    let sum = 0;
    for (let i = 0; i < text.length; i++) {
      sum += text.charCodeAt(i);
    }

    return colors[sum % colors.length];
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserName("");
        setUserEmail("");
        setProfileImage("");
        return;
      }

      try {
        setUserEmail(user.email || "");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          const fullName =
            `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
            data.name ||
            user.displayName ||
            user.email ||
            "User";

          setUserName(fullName);
          setProfileImage(data.profileImage || "");
        } else {
          setUserName(user.displayName || user.email || "User");
          setProfileImage("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      setUploading(true);

      const imageRef = ref(storage, `profileImages/${user.uid}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      await setDoc(
        doc(db, "users", user.uid),
        {
          profileImage: downloadURL
        },
        { merge: true }
      );

      setProfileImage(downloadURL);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("selectedRole");
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    }
  };

  const employeeActive =
    location.pathname === "/employee" ||
    location.pathname.startsWith("/employee-profile");

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      <ul className="sidebar-menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaThLarge className="menu-icon" /> Dashboard
        </NavLink>

        <NavLink
          to="/employee"
          className={employeeActive ? "nav-item active" : "nav-item"}
        >
          <FaUsers className="menu-icon" /> Employees
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaCalendarCheck className="menu-icon" /> Attendance
        </NavLink>

        <NavLink
          to="/leave"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaCalendarAlt className="menu-icon" /> Leave
        </NavLink>

        <NavLink
          to="/payroll"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaWallet className="menu-icon" /> Payroll
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <FaChartBar className="menu-icon" /> Reports
        </NavLink>

        <button type="button" onClick={handleLogout} className="logout-item">
          <FaSignOutAlt className="menu-icon" /> LogOut
        </button>
      </ul>

      <div className="sidebar-profile">
        <label htmlFor="profileUpload" className="profile-upload-label">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="profile-img"
            />
          ) : (
            <div
              className="profile-initials"
              style={{ backgroundColor: getAvatarColor(userName || userEmail) }}
            >
              {getInitials(userName, userEmail)}
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

        <div className="profile-info">
          <h4>{userName || "Loading..."}</h4>
          <p>{uploading ? "Uploading..." : "Click photo to change"}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;