import React, { useEffect, useRef, useState } from "react";
import "../css/EmployeeProfile.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  FaEnvelope,
  FaIdBadge,
  FaBriefcase,
  FaCube,
  FaGraduationCap,
  FaFileAlt,
  FaUserEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

const EmployeeProfile = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const personalRef = useRef(null);
  const contactRef = useRef(null);
  const jobRef = useRef(null);
  const financialRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const employeeRef = doc(db, "employee", id);

    const unsubscribe = onSnapshot(
      employeeRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setEmployee(data);
          setFormData(data);
        } else {
          setEmployee(null);
        }
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching employee:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const scrollToSection = (sectionName, ref) => {
    setActiveSection(sectionName);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(employee || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const employeeRef = doc(db, "employee", id);

      const updatedData = {
        name: formData.name || "",
        email: formData.email || "",
        role: formData.role || "",
        status: formData.status || "",
        employeeCode: formData.employeeCode || "",
        department: formData.department || "",
        jobCategory: formData.jobCategory || "",
        reportsTo: formData.reportsTo || "",
        gender: formData.gender || "",
        dob: formData.dob || "",
        nationality: formData.nationality || "",
        degree: formData.degree || "",
        university: formData.university || "",
        graduationYear: formData.graduationYear || "",
        certification: formData.certification || "",
        joinDate: formData.joinDate || "",
        probationEnds: formData.probationEnds || "",
        workingLocation: formData.workingLocation || "",
        contractType: formData.contractType || "",
        professionalSummary: formData.professionalSummary || "",
      };

      await updateDoc(employeeRef, updatedData);
      setIsEditing(false);
    } catch (error) {
      console.log("Save error:", error);
      alert("Failed to update employee profile.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, name, fallback = "-") => (
    <div>
      <span>{label}</span>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          className="profile-input"
        />
      ) : (
        <strong>{employee?.[name] || fallback}</strong>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="profile-layout">
        <Sidebar />
        <div className="profile-main">
          <p className="profile-loading">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="profile-layout">
        <Sidebar />
        <div className="profile-main">
          <p className="profile-loading">Employee not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <Sidebar />

      <div className="profile-main">
        <div className="profile-breadcrumb">
          <span>Employees</span> / <span className="active">Employees Profile</span>
        </div>

        <div className="profile-wrapper">
          <div className="profile-left-panel">
            <h4>PROFILE SECTIONS</h4>

            <button
              className={`profile-section-btn ${activeSection === "personal" ? "active" : ""}`}
              onClick={() => scrollToSection("personal", personalRef)}
            >
              Personal Details
            </button>

            <button
              className={`profile-section-btn ${activeSection === "contact" ? "active" : ""}`}
              onClick={() => scrollToSection("contact", contactRef)}
            >
              Contact Details
            </button>

            <button
              className={`profile-section-btn ${activeSection === "job" ? "active" : ""}`}
              onClick={() => scrollToSection("job", jobRef)}
            >
              Job Details
            </button>

            <button
              className={`profile-section-btn ${activeSection === "financial" ? "active" : ""}`}
              onClick={() => scrollToSection("financial", financialRef)}
            >
              Financial Details
            </button>
          </div>

          <div className="profile-right-panel">
            <div className="profile-top-card" ref={personalRef}>
              <div className="profile-user-block">
                <div className="profile-avatar">
                  {employee.profileImage ? (
                    <img src={employee.profileImage} alt="profile" />
                  ) : (
                    <span>{getInitials(employee.name)}</span>
                  )}
                  <div className="online-dot"></div>
                </div>

                <div className="profile-user-info">
                  <div className="profile-name-row">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        className="profile-main-input"
                      />
                    ) : (
                      <h2>{employee.name || "-"}</h2>
                    )}

                    {isEditing ? (
                      <input
                        type="text"
                        name="status"
                        value={formData.status || ""}
                        onChange={handleChange}
                        className="profile-status-input"
                      />
                    ) : (
                      <span className="status-badge">{employee.status || "Active"}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      name="role"
                      value={formData.role || ""}
                      onChange={handleChange}
                      className="profile-role-input"
                    />
                  ) : (
                    <p className="profile-role">{employee.role || "-"}</p>
                  )}

                  <div className="profile-meta">
                    <span>
                      <FaEnvelope />
                      {isEditing ? (
                        <input
                          type="text"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          className="profile-inline-input"
                        />
                      ) : (
                        employee.email || "-"
                      )}
                    </span>

                    <span>
                      <FaIdBadge />
                      {isEditing ? (
                        <input
                          type="text"
                          name="employeeCode"
                          value={formData.employeeCode || ""}
                          onChange={handleChange}
                          className="profile-inline-input"
                        />
                      ) : (
                        employee.employeeCode || employee.empId || employee.id
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button className="edit-profile-btn" onClick={handleEditToggle}>
                  <FaUserEdit /> Edit Profile
                </button>
              ) : (
                <div className="profile-action-buttons">
                  <button className="save-profile-btn" onClick={handleSave} disabled={saving}>
                    <FaSave /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="cancel-profile-btn" onClick={handleCancel}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="profile-grid-two" ref={contactRef}>
              <div className="profile-card">
                <h3><FaBriefcase /> Employee info</h3>
                <div className="info-list">
                  {renderField("Department", "department")}
                  {renderField("Job Category", "jobCategory")}
                  {renderField("Reports to", "reportsTo")}
                </div>
              </div>

              <div className="profile-card">
                <h3><FaCube /> Identity Details</h3>
                <div className="info-list">
                  {renderField("Gender", "gender")}
                  {renderField("Date of Birth", "dob")}
                  {renderField("Nationality", "nationality")}
                </div>
              </div>
            </div>

            <div className="profile-card" ref={jobRef}>
              <h3><FaGraduationCap /> Education Qualifications</h3>
              <div className="education-grid">
                {renderField("Degree", "degree")}
                {renderField("University", "university")}
                {renderField("Graduation Year", "graduationYear")}
                {renderField("Certification", "certification")}
              </div>
            </div>

            <div className="profile-card compact-card" ref={financialRef}>
              <div className="compact-grid">
                {renderField("Join Date", "joinDate")}
                {renderField("Probation Ends", "probationEnds")}
                {renderField("Working Location", "workingLocation")}
                {renderField("Contract Type", "contractType")}
              </div>
            </div>

            <div className="profile-card">
              <h3><FaFileAlt /> Professional Summary</h3>
              {isEditing ? (
                <textarea
                  name="professionalSummary"
                  value={formData.professionalSummary || ""}
                  onChange={handleChange}
                  className="profile-textarea"
                  rows="5"
                />
              ) : (
                <div className="summary-box">
                  {employee.professionalSummary || "-"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;