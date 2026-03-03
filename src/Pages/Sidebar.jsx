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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const Sidebar = () => {
 
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("");

  
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  };

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Logged in user:", user);
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
           console.log("Firestore Data:", docSnap.data()); 
          if (docSnap.exists()) {
            const data = docSnap.data();

            setUserName(
              `${data.firstName || ""} ${data.lastName || ""}`.trim()
            );

            if (data.profileImage) {
              setProfileImage(data.profileImage);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  
  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Image must be under 2MB");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    
    const imageRef = ref(storage, `profileImages/${user.uid}`);
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

    alert("Profile image uploaded successfully!");

  } catch (error) {
    console.error("Upload Error:", error);
    alert(error.message);
  }
};


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>

      <ul className="sidebar-menu">
       <NavLink to ="/Dashboard"  end className={
        ({ isActive }) =>isActive ? "nav-item active" : "nav-item"
       }>
       <FaThLarge className="menu-icon" />
        Dashboard
      </NavLink>


        <NavLink to="/Employee"  end className={
        ({ isActive }) =>isActive ? "nav-item active" : "nav-item"
       }>
          <FaUsers className="menu-icon" />
          Employees
        </NavLink>

        <NavLink to="/Attendance"  end className={
        ({ isActive }) =>isActive ? "nav-item active" : "nav-item"
       }>
          <FaCalendarCheck className="menu-icon" />
          Attendance
        </NavLink>

        <NavLink to="/Leave"  end className={
        ({ isActive }) =>isActive ? "nav-item active" : "nav-item"
       }>
          <FaCalendarAlt className="menu-icon" />
          Leave
        </NavLink>

        <NavLink to="/Payroll"  end className={
        ({ isActive }) =>isActive ? "nav-item active" : "nav-item"
       }>
          <FaWallet className="menu-icon" />
          Payroll
        </NavLink>

        <NavLink to="/Report"  end className={
        ({ isActive }) =>isActive ? "nav-item active" : "nav-item"
       }>
          <FaChartBar className="menu-icon" />
          Reports
        </NavLink>
        <NavLink to="/Login" end className={
          ({isActive}) =>isActive ? "logout-item active" : "logout-item"
        }>
          <FaSignOutAlt className="menu-icon"/>
          LogOut
          </NavLink>
        
      </ul>

      
      <div className="sidebar-profile">
        <label htmlFor="profileUpload">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="profile-img"
            />
          ) : (
            <div className="profile-initials">
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
          <p>HR Manager</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
