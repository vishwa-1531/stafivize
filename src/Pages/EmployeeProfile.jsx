import React, { useEffect, useState } from "react";
import "../css/EmployeeProfile.css";
import "../css/Sidebar.css";
import "../css/Topbar.css";
import Topbar from "./Topbar";
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
  FaPhoneAlt,
  FaUserShield,
} from "react-icons/fa";

const EmployeeProfile = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const basicSalaryValue = Number(formData.basicSalary || 0);
  const hraValue = Number(formData.hra || 0);
  const otherAllowanceValue = Number(formData.otherAllowance || 0);

  const totalMonthlyGross =
    basicSalaryValue + hraValue + otherAllowanceValue;

  const handleSave = async () => {
    try {
      setSaving(true);
      const employeeRef = doc(db, "employee", id);

      const updatedData = {
        name: formData.name || "",
        email: formData.email || "",
        role: formData.role || "",
        personalEmail: formData.personalEmail || "",
        workEmail: formData.workEmail || "",
        phone: formData.phone || "",
        altPhone: formData.altPhone || "",
        address: formData.address || "",
        contactCertification: formData.contactCertification || "",

        emergencyName: formData.emergencyName || "",
        emergencyRelation: formData.emergencyRelation || "",
        emergencyPhone: formData.emergencyPhone || "",

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
        workMode: formData.workMode || "",
        shiftTiming: formData.shiftTiming || "",

        bankName: formData.bankName || "",
        accountNumber: formData.accountNumber || "",
        ifscCode: formData.ifscCode || "",
        accountType: formData.accountType || "",

        panNumber: formData.panNumber || "",
        pfNumber: formData.pfNumber || "",

        basicSalary: formData.basicSalary || "",
        hra: formData.hra || "",
        otherAllowance: formData.otherAllowance || "",
        totalMonthlyGross: totalMonthlyGross,
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
        <Topbar
  mainTitle="EMPLOYEE PROFILE"
  section="DETAILS"
  notifications={[
    { id: "1", text: "Employee profile loaded successfully" }
  ]}
  helpItems={[
    "View employee personal and contact details.",
    "Check role, department, and status information.",
    "Update profile data from the profile page."
  ]}
/>
        <div className="profile-breadcrumb">
          <span>Employees</span> /{" "}
          <span className="active">Employees Profile</span>
          
        </div>

        <div className="profile-wrapper">
          <div className="profile-left-panel">
            <h4>PROFILE SECTIONS</h4>

            <button
              className={`profile-section-btn ${
                activeSection === "personal" ? "active" : ""
              }`}
              onClick={() => setActiveSection("personal")}
            >
              Personal Details
            </button>

            <button
              className={`profile-section-btn ${
                activeSection === "contact" ? "active" : ""
              }`}
              onClick={() => setActiveSection("contact")}
            >
              Contact Details
            </button>

            <button
              className={`profile-section-btn ${
                activeSection === "job" ? "active" : ""
              }`}
              onClick={() => setActiveSection("job")}
            >
              Job Details
            </button>

            <button
              className={`profile-section-btn ${
                activeSection === "financial" ? "active" : ""
              }`}
              onClick={() => setActiveSection("financial")}
            >
              Financial Details
            </button>
          </div>

          <div className="profile-right-panel">
            {(activeSection === "personal" || activeSection === "contact") && (
              <div className="profile-top-card">
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

                      <span
  className={`status-badge ${
    employee.status === "DeActive" ? "status-DeActive" : "status-Active"
  }`}
>
  {employee.status || "DeActive"}
</span>
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
                        {employee.employeeCode || employee.empId || employee.id}
                      </span>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    className="edit-profile-btn"
                    onClick={handleEditToggle}
                  >
                    <FaUserEdit /> Edit Profile
                  </button>
                ) : (
                  <div className="profile-action-buttons">
                    <button
                      className="save-profile-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <FaSave /> {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="cancel-profile-btn"
                      onClick={handleCancel}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === "personal" && (
              <>
                <div className="profile-grid-two">
                  <div className="profile-card">
                    <h3>
                      <FaBriefcase /> Employee info
                    </h3>
                    <div className="info-list">
                      {renderField("Department", "department")}
                      {renderField("Job Category", "jobCategory")}
                      {renderField("Reports to", "reportsTo")}
                    </div>
                  </div>

                  <div className="profile-card">
                    <h3>
                      <FaCube /> Identity Details
                    </h3>
                    <div className="info-list">
                      {renderField("Gender", "gender")}
                      {renderField("Date of Birth", "dob")}
                      {renderField("Nationality", "nationality")}
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h3>
                    <FaGraduationCap /> Education Qualifications
                  </h3>
                  <div className="education-grid">
                    {renderField("Degree", "degree")}
                    {renderField("University", "university")}
                    {renderField("Graduation Year", "graduationYear")}
                    {renderField("Certification", "certification")}
                  </div>
                </div>

                <div className="profile-card compact-card">
                  <div className="compact-grid">
                    {renderField("Join Date", "joinDate")}
                    {renderField("Probation Ends", "probationEnds")}
                    {renderField("Working Location", "workingLocation")}
                    {renderField("Contract Type", "contractType")}
                  </div>
                </div>

                <div className="profile-card">
                  <h3>
                    <FaFileAlt /> Professional Summary
                  </h3>
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
              </>
            )}

            {activeSection === "contact" && (
              <>
                <div className="profile-card">
                  <div className="contact-card-header">
                    <h3>
                      <FaPhoneAlt /> Contact Information
                    </h3>
                    {!isEditing && (
                      <button
                        className="manage-info-btn"
                        onClick={handleEditToggle}
                        type="button"
                      >
                        Manage Info
                      </button>
                    )}
                  </div>

                  <div className="contact-grid">
                    <div>
                      <span>Personal Email</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="personalEmail"
                          value={formData.personalEmail || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.personalEmail || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Work Email</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="workEmail"
                          value={formData.workEmail || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.workEmail || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Phone Number</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.phone || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Alternative Phone Number</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="altPhone"
                          value={formData.altPhone || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.altPhone || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Current Address</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.address || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Certification</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="contactCertification"
                          value={formData.contactCertification || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.contactCertification || "-"}</strong>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <h3 className="emergency-heading">
                    <FaUserShield /> Emergency Contact
                  </h3>

                  <div className="contact-grid emergency-grid">
                    <div>
                      <span>Contact Name</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="emergencyName"
                          value={formData.emergencyName || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.emergencyName || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Relationship</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="emergencyRelation"
                          value={formData.emergencyRelation || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.emergencyRelation || "-"}</strong>
                      )}
                    </div>

                    <div>
                      <span>Phone Number</span>
                      {isEditing ? (
                        <input
                          type="text"
                          name="emergencyPhone"
                          value={formData.emergencyPhone || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>{employee.emergencyPhone || "-"}</strong>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "job" && (
              <>
                <div className="profile-card">
                  <div className="contact-card-header">
                    <h3>
                      <FaBriefcase /> Job Information
                    </h3>
                    <span className="status-badge">
                      {employee.status || "Active"}
                    </span>
                  </div>

                  <div className="contact-grid job-grid">
                    {renderField("Job Title", "role")}
                    {renderField("Department", "department")}
                    {renderField("Employment Type", "jobCategory")}
                    {renderField("Join Date", "joinDate")}
                    {renderField("Probation Period", "probationEnds")}
                    {renderField("Reporting Manager", "reportsTo")}
                  </div>
                </div>

                <div className="profile-card">
                  <h3>
                    <FaCube /> Work Location & Schedule
                  </h3>
                  <div className="contact-grid emergency-grid">
                    {renderField("Office", "workingLocation")}
                    {renderField("Work Mode", "workMode")}
                    {renderField("Shift", "shiftTiming")}
                  </div>
                </div>
              </>
            )}

            {activeSection === "financial" && (
              <>
                <div className="profile-card">
                  <div className="contact-card-header">
                    <h3>
                      <FaIdBadge /> Bank Information
                    </h3>
                    {!isEditing ? (
                      <button className="edit-btn" onClick={handleEditToggle}>
                        <FaUserEdit /> Edit
                      </button>
                    ) : (
                      <div className="profile-action-buttons">
                        <button
                          className="save-profile-btn"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          <FaSave /> {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="cancel-profile-btn"
                          onClick={handleCancel}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="contact-grid">
                    {renderField("Bank Name", "bankName")}
                    {renderField("Account Number", "accountNumber")}
                    {renderField("SWIFT / IFSC Code", "ifscCode")}
                    {renderField("Account Type", "accountType")}
                  </div>
                </div>

                <div className="profile-card">
                  <h3>
                    <FaFileAlt /> Tax Information
                  </h3>
                  <div className="contact-grid">
                    {renderField("Tax ID / PAN", "panNumber")}
                    {renderField("Social Security / PF Number", "pfNumber")}
                  </div>
                </div>

                <div className="profile-card">
                  <div className="contact-card-header">
                    <h3>₹ Salary Details</h3>
                    <span className="salary-cycle-badge">ANNUAL CYCLE</span>
                  </div>

                  <div className="salary-grid">
                    <div>
                      <span>BASIC SALARY</span>
                      {isEditing ? (
                        <input
                          type="number"
                          name="basicSalary"
                          value={formData.basicSalary || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>₹ {employee.basicSalary || "0"}</strong>
                      )}
                    </div>

                    <div>
                      <span>HRA</span>
                      {isEditing ? (
                        <input
                          type="number"
                          name="hra"
                          value={formData.hra || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>₹ {employee.hra || "0"}</strong>
                      )}
                    </div>

                    <div>
                      <span>OTHER ALLOWANCE</span>
                      {isEditing ? (
                        <input
                          type="number"
                          name="otherAllowance"
                          value={formData.otherAllowance || ""}
                          onChange={handleChange}
                          className="profile-input"
                        />
                      ) : (
                        <strong>₹ {employee.otherAllowance || "0"}</strong>
                      )}
                    </div>
                  </div>

                  <div className="salary-total-box">
                    <div>
                      <span className="salary-total-label">
                        TOTAL MONTHLY GROSS
                      </span>
                      <p className="salary-total-subtext">
                        Pre-tax deductions and benefits
                      </p>
                    </div>

                    <h2>₹ {totalMonthlyGross.toLocaleString("en-IN")}</h2>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;