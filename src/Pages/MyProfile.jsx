import React, { useEffect, useState } from "react";
import SidebarEmployee from "./SidebarEmployee";
import "../css/MyProfile.css";

import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

function MyProfile() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState({});
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [docId, setDocId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  
  const employeeEditableFields = [
    "firstName",
    "lastName",
    "jobType",
    "phone",
    "email",
    "city",
    "address",
   "emergencyName",
"emergencyRelation",
"emergencyPhone",
    "degree",
    "university",
    "graduationYear",
    "stream",
  ];


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

 
  useEffect(() => {
    if (!user) return;

    const companyId = sessionStorage.getItem("companyId");

    const q = query(
      collection(db, "employee"),
      where("uid", "==", user.uid),
      where("companyId", "==", companyId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();

        setDocId(docSnap.id);
        setEmployee(data);

       
        setFormData(data);
      }
    });

    return () => unsub();
  }, [user]);

 
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (!employeeEditableFields.includes(name)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData(employee); 
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
    setImageFile(null);
  };


  const handleSave = async () => {
    try {
      if (!docId) return;

      if (!formData.firstName || !formData.lastName) {
        alert("Name is required");
        return;
      }

      let imageUrl = employee.photoURL || "";

      
      if (imageFile) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);

        
        imageUrl = imageUrl + "?t=" + new Date().getTime();
      }

      
      const safeData = {};
      employeeEditableFields.forEach((field) => {
        safeData[field] = formData[field] || "";
      });

      await updateDoc(doc(db, "employee", docId), {
        ...safeData,
        photoURL: imageUrl,
        updatedAt: new Date(),
        updatedBy: "employee",
      });

      setEmployee({ ...employee, ...safeData, photoURL: imageUrl });
      setIsEditing(false);
      setImageFile(null);
    } catch (error) {
      console.error(error);
    }
  };

  
  const getInitials = (name = "") => {
    if (!name) return "NA";
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0] + words[1][0]
      : words[0][0];
  };

  return (
    <div className="myprofile-layout">
      <SidebarEmployee />

      <div className="myprofile-container">
        <div className="myprofile-header">
          <h2>My Profile</h2>

          {!isEditing ? (
            <button className="myprofile-edit-btn" onClick={handleEdit}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className="myprofile-edit-btn" onClick={handleSave}>
                Save
              </button>
              <button className="myprofile-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}
        </div>

        {/* TOP CARD */}
        <div className="myprofile-card">
          <div
            className="avatar"
            onClick={() =>
              isEditing && document.getElementById("fileInput").click()
            }
            style={{ cursor: isEditing ? "pointer" : "default" }}
          >
            {employee?.photoURL ? (
              <img
                src={employee.photoURL}
                alt="profile"
                className="profile-img"
              />
            ) : (
              getInitials(
                `${employee.firstName || ""} ${employee.lastName || ""}`
              )
            )}

            {isEditing && (
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            )}
          </div>

          <div>
            <h3>
              {employee.firstName || ""} {employee.lastName || ""}
            </h3>
           <p>{user?.email || ""}</p>
            <span className="emp-id">
              {employee.employeeId || "EMP-000"}
            </span>
          </div>

          <span className="myprofile-status">Active</span>
        </div>

       
        <div className="myprofile-section">
          <h4>Personal Details</h4>
          <div className="grid">
            <input
              placeholder="FirstName"
              name="firstName"
              value={isEditing ? formData.firstName || "" : employee.firstName || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input
                placeholder="LastName"
              name="lastName"
              value={isEditing ? formData.lastName || "" : employee.lastName || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />

            <input  placeholder="Department" name="department" 
            value={isEditing ? formData.department ||"" : employee.department || ""} 
            onChange={handleChange}
            readOnly={!isEditing} />
            <input  placeholder="Role" name="role" 
            value={isEditing ? formData.role ||"" :employee.role || ""}
            onChange={handleChange}
             readOnly={!isEditing} />
            <input  placeholder="Job Type"name="jobType" 
            value={isEditing ?formData.jobType ||"" :employee.jobType || ""} 
            onChange={handleChange}
            readOnly={!isEditing} />
          </div>
        </div>

       
        <div className="myprofile-section">
          <h4>Contact Details</h4>
          <div className="myprofile-grid">
            <input
             placeholder="Phone Number"
              name="phone"
              value={isEditing ? formData.phone || "" : employee.phone || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input placeholder="E-mail"name="email"
             value={isEditing ?formData.email || "":employee.email || ""}
             onChange={handleChange}
             readOnly ={!isEditing}/>
            <input
            placeholder="City"
              name="city"
              value={isEditing ? formData.city || "" : employee.city || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input
             placeholder="Address"
              name="address"
              value={isEditing ? formData.address || "" : employee.address || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
        
<div className="myprofile-section">
  <h4>Next of Kin</h4>
  <div className="myprofile-grid">

    <input
    placeholder="Emergency Name"
  name="emergencyName"
  value={isEditing ? formData.emergencyName || "" : employee.emergencyName || ""}
  onChange={handleChange}
  readOnly={!isEditing}
/>

<input
placeholder="Relation"
  name="emergencyRelation"
  value={isEditing ? formData.emergencyRelation || "" : employee.emergencyRelation || ""}
  onChange={handleChange}
  readOnly={!isEditing}
/>

<input
 placeholder="Emergency Contact number"
  name="emergencyPhone"
  value={isEditing ? formData.emergencyPhone || "" : employee.emergencyPhone || ""}
  onChange={handleChange}
  readOnly={!isEditing}
/>    <input
     
      name="occupation"
      value={isEditing ? formData.occupation || "" : employee.occupation || ""}
      onChange={handleChange}
      readOnly={!isEditing}
      placeholder="Occupation"
    />

    <input
      name="kinAddress"
      value={isEditing ? formData.kinAddress || "" : employee.kinAddress || ""}
      onChange={handleChange}
      readOnly={!isEditing}
      placeholder="Address"
    />

  </div>
</div>
        
        <div className="myprofile-section">
          <h4>Education</h4>
          <div className="myprofile-grid">
            <input
            placeholder="Highest Education / Degree"
              name="degree"
              value={isEditing ? formData.degree || "" : employee.degree || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input
              placeholder="Name Of University "
              name="university"
              value={isEditing ? formData.university || "" : employee.university || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          <input
          placeholder="Year Of Graduation"
  name="graduationYear"
  value={
    isEditing
      ? formData.graduationYear ?? ""
      : employee.graduationYear ?? employee.year ?? ""
  }
  onChange={handleChange}
  readOnly={!isEditing}
/>
            <input
            placeholder="Stream"
              name="stream"
              value={isEditing ? formData.stream || "" : employee.stream || ""}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;