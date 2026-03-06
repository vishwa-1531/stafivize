import React, { useState } from "react";
import "../css/Admin.css";
import logo from "../image/logo.png";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaArrowRight, FaCamera, FaUser } from "react-icons/fa";

const Admin = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state || {};
  const companyData = location.state || {};
  const getStep = () => {
    if (location.pathname === "/SignUp") return 1;
    if (location.pathname === "/Admin") return 2;
    if (location.pathname === "/Finish") return 3;
    return 2;
  };

  const currentStep = getStep();

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [firstName, setFirstName] = useState(editData.firstName || "");
  const [lastName, setLastName] = useState(editData.lastName || "");
  const [email, setEmail] = useState(editData.email || "");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState(editData.phone || "");
  const [jobTitle, setJobTitle] = useState(editData.jobTitle || "");
  const [idType, setIdType] = useState(editData.idType || "");
  const [idNumber, setIdNumber] = useState(editData.idNumber || "");
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

  const handleContinue = (e) => {

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

    const adminData = {
      firstName,
      lastName,
      email,
      phone: countryCode + " " + phone,
      jobTitle,
      idType,
      idNumber
    };

   navigate("/Review", {
  state: {
    ...companyData,

    firstName,
    lastName,
    email,
    phone,
    jobTitle,
    idType,
    idNumber
  }
});

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

          <form onSubmit={handleContinue}>

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
                />

              </div>

            </div>

            <div className="Adminform-grid">

              <div className="Adminform-row">

                <div className="Adminform-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    placeholder="john"
                    value={firstName}
                    onChange={(e)=>setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="Adminform-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Anderson"
                    value={lastName}
                    onChange={(e)=>setLastName(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="Adminform-row-email-phone">

                <div className="Adminform-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="john.anderson@company.com"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="Adminform-group">

                  <label>Phone Number *</label>

                  <div className="phone-input-group">

                    <select
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

              <div className="Adminform-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  placeholder="CEO"
                  value={jobTitle}
                  onChange={(e)=>setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div className="Adminform-row">

                <div className="Adminform-group">
                  <label>ID Type</label>
                  <select
                    value={idType}
                    onChange={(e)=>setIdType(e.target.value)}
                    required
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
                    value={idNumber}
                    onChange={(e)=>setIdNumber(e.target.value)}
                    required
                  />
                </div>

              </div>

              <div className="checkbox-wrapper">

                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e)=>setTerms(e.target.checked)}
                />

                <label>
                  I agree to the <Link to="/condition">Terms of Service</Link>
                </label>

              </div>

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