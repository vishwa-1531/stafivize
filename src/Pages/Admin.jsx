import React, { useState } from "react";
import "../css/Admin.css";
import logo from "../image/logo.png";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaArrowRight, FaCamera, FaUser } from "react-icons/fa";

import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const Admin = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const getStep = () => {
    if (location.pathname === "/SignUp") return 1;
    if (location.pathname === "/Admin") return 2;
    if (location.pathname === "/Finish") return 3;
    return 2;
  };

  const currentStep = getStep();

  const [profilePhoto, setProfilePhoto] = useState(null);

  // 🔹 Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [terms, setTerms] = useState(false);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    navigate("/SignUp");
  };

  // 🔹 Continue Button
  const handleContinue = async (e) => {

    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !jobTitle ||
      !idType ||
      !idNumber
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (!terms) {
      alert("Please accept Terms of Service");
      return;
    }

    try {

      await addDoc(collection(db, "adminDetails"), {
        firstName,
        lastName,
        email,
        phone: countryCode + " " + phone,
        jobTitle,
        idType,
        idNumber,
        createdAt: new Date()
      });

      alert("Admin details saved successfully");

      navigate("/Review");

    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data");
    }
  };

  return (
    <div className="Admin-header">

      <div className="Admin-header-top">
        <img src={logo} alt="logo" className="Adminlogo-img" />
      </div>

      <br/><br/>

      <div className="Signup-steps">
        <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
          <div className="circle">1</div>
          <p>Company details</p>
        </div>

        <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
          <div className="circle">2</div>
          <p>Admin details</p>
        </div>

        <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
          <div className="circle">3</div>
          <p>Finish</p>
        </div>
      </div>

      <div className="Admin-page">

        <div className="Admin-card">

          <h2>Admin Details</h2>
          <p className="Adminsubtitle">
            Provide your details to help us verify your account.
          </p>

          <form onSubmit={handleContinue}>

            {/* Profile Photo */}
            <div className="profile-photo-section">

              <div className="profile-photo-wrapper">

                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="profile-photo-preview"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    <FaUser size={30} />
                  </div>
                )}

                <label htmlFor="profilePhotoInput" className="upload-photo-btn">
                  <FaCamera size={13} />
                </label>

                <input
                  type="file"
                  id="profilePhotoInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                  required
                />

              </div>

              <div className="profile-photo-text">
                <h3>Profile Photo</h3>
                <p>Upload a professional photo. Recommended size: 400x400px</p>
              </div>

            </div>

            <div className="Adminform-grid">

              {/* First Name */}
              <div className="Adminform-row">

                <div className="Adminform-group">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="john"
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="Adminform-group">
                  <label>Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Anderson"
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value)}
                    required
                  />
                </div>

              </div>

              {/* Email + Phone */}
              <div className="Adminform-row-email-phone">

                <div className="Adminform-group">
                  <label>Email Address <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <input
                      type="email"
                      placeholder="john.anderson@company.com"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      required
                    />
                    <span className="input-icon">@</span>
                  </div>
                </div>

                <div className="Adminform-group">
                  <label>Phone Number <span className="required">*</span></label>

                  <div className="phone-input-group">

                    <select required
                      value={countryCode}
                      onChange={(e)=>setCountryCode(e.target.value)}
                    >
                      <option>+1</option>
                      <option>+91</option>
                      <option>+255</option>
                    </select>

                    <input
                     type="tel"
                        placeholder="9876543210"
                         value={phone}
                         onChange={(e)=>setPhone(e.target.value)}
                         required
                         maxLength="10"
                         pattern="[0-9]{10}"
                         title="Please enter exactly 10 digits"
                     />

                  </div>

                </div>

              </div>

              {/* Job Title */}
              <div className="Adminform-row-full">

                <div className="Adminform-group">
                  <label>Job Title <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. CEO, CTO"
                    value={jobTitle}
                    onChange={(e)=>setJobTitle(e.target.value)}
                    required
                  />
                </div>

              </div>

              {/* Verification */}
              <div className="Adminform-verification">

                <h3>Verification</h3>

                <div className="Adminform-row">

                  <div className="Adminform-group">
                    <label>Government ID Type</label>
                    <select required
                      value={idType}
                      onChange={(e)=>setIdType(e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option>Passport</option>
                      <option>Driving License</option>
                    </select>
                  </div>

                  <div className="Adminform-group">
                    <label>ID Number</label>
                    <input
                      type="text"
                      placeholder="Enter ID number"
                      value={idNumber}
                      onChange={(e)=>setIdNumber(e.target.value)}
                      required
                    />
                  </div>

                </div>

                <div className="checkbox-wrapper">

                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={terms}
                    onChange={(e)=>setTerms(e.target.checked)}
                    required
                  />

                  <label htmlFor="termsCheckbox" className="checkbox-label">
                    I agree to the <Link to="/condition">Terms of Service</Link>
                    and confirm I am authorized to create this account.
                  </label>

                </div>

              </div>

              {/* Buttons */}
              <div className="button-group">

                <button
                  type="button"
                  className="privious-btn"
                  onClick={handlePrevious}

                >
                  Previous
                </button>

                <button
              type="submit"
              className="Signupsubmit-btn"
             >
                  Continue <FaArrowRight />
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Admin;