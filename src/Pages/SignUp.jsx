import React, { useRef, useState } from "react";
import "../css/SignUp.css";
import logo from "../image/logo.png";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";

import { db,storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const documentRef = useRef(null);
  const logoRef = useRef(null);

  const [documentName, setDocumentName] = useState("");
  const [logoName, setLogoName] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
const [companyWebsite, setCompanyWebsite] = useState("");
const [industry, setIndustry] = useState("");
const [companySize, setCompanySize] = useState("");
  // STEP DETECTION
  const getStep = () => {
    if (location.pathname === "/SignUp") return 1;
    if (location.pathname === "/Admin") return 2;
    if (location.pathname === "/Finish") return 3;
    return 1;
  };

  const currentStep = getStep();

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) setDocumentName(file.name);
    setDocumentFile(file);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setLogoName(file.name);
    setLogoFile(file);
  };
 const handleContinue = async (e) => {
  e.preventDefault();

  try {
    if (!companyName || !companyWebsite || !industry || !companySize) {
      alert("Please fill all required company details");
      return;
    }

    console.log("Saving to Firestore...");
    console.log(storage, ref, uploadBytes, getDownloadURL);
console.log(documentFile, logoFile);

    await addDoc(collection(db, "companies"), {
      companyName,
      companyWebsite,
      industry,
      companySize,
      documentName: documentName || "",
      logoName: logoName || "",
      createdAt: new Date(),
    });

    console.log("Data Saved Successfully ✅");

    navigate("/Admin");

  } catch (error) {
    console.error("Firestore Error:", error);
    alert(error.message);
  }
};
  return (
    <div className="Signup-header">
      <div className="Signup-header-top">
        <div className="Signup-left">
          <img src={logo} alt="logo" className="Signuplogo-img" />
        </div>

        <div className="Signup-right">
          Already have an account? <Link to="/Login">Sign in</Link>
        </div>
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


      <div className="Signup-page">
        <div className="Signup-card">

         
          <h2>Company Information</h2>
          <p className="subtitle">
            Provide your business details to help us verify your account.
          </p>

          <form onSubmit={handleContinue}>
            <div className="Signupform-grid">
              <div className="Signupform-group">
                <label>Company Name</label>
                <input
                   type="text"
                   placeholder="Enter your company name"
                 value={companyName}
                 onChange={(e) => setCompanyName(e.target.value)}
              />
              </div>

              <div className="Signupform-group">
                <label>Company Website</label>
                <input
                type="text"
                placeholder="https://yourcompany.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
               />
              </div>

              <div className="Signupform-group">
                <label>Industry</label>
               <select
               value={industry}
               onChange={(e) => setIndustry(e.target.value)}
               >
               <option value="">Select an industry</option>
               <option value="chemical">Chemical</option>
               <option value="Medicine">Medicine</option>
               <option value="Technical">Technical</option>
               
               </select>
              </div>

              <div className="Signupform-group">
                <label>Company Size</label>
                <select
                 value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                >
               <option value="">Select company size</option>
               <option value="Startup">1-10 Employees(Startup)</option>
               <option value="Small Business">11-50 Employees(Small Business)</option>
               <option value="Medium Bussiness">51-200 Employees(Medium Bussiness)</option>
               <option value="Growing Company">201-500 Employees(Growing Company)</option>
               <option value="Large Company">501-1000 Employees(Large Company)</option>
               <option value="Enterprise">1000+ Employees(Enterprise)</option>
               
                </select>
                
              </div>
            </div>
            
            <div className="Signupform-group full">
              <label>Business Description</label>
              <textarea placeholder="Tell us about your company, its mission, and the services you provide..." />
            </div>

            <div className="Signupform-grid">
              <div className="Signupform-group">
                <label>Tax ID / Business Registration Number</label>
                <input type="text" placeholder="e.g., 12-3456789" />
              </div>

              <div className="Signupform-group">
                <label>Year Established</label>
                <input type="text" placeholder="e.g., 2026" />
              </div>
            </div>

            <h3>Company Address</h3>

            <div className="Signupform-group full">
              <label>Street Address</label>
              <input type="text" placeholder="Radhanpurroad " />
            </div>

            <div className="Signupform-grid">
              <div className="Signupform-group">
                <label>City</label>
                <input type="text" placeholder="Mehsana" />
              </div>

              <div className="Signupform-group">
                <label>State / Province</label>
                <input type="text" placeholder="Gujarat" />
              </div>

              <div className="Signupform-group">
                <label>Country</label>
                <select>
                  <option>Select a country</option>
                  <option>India</option>
                  <option>America</option>
                  <option>London</option>
                  <option>Dubai</option>
                  <option>France</option>
                </select>
              </div>

              <div className="Signupform-group">
                <label>Zip / Postal Code</label>
                <input type="text" placeholder="384002" />
              </div>
            </div>

            <h3>Contact Information</h3>

            <div className="contact-row">
              <div className="Signupform-group">
                <label>Company Phone Number</label>
                <div className="Signupphone-wrapper">
                  <select>
                    <option>+91</option>
                    <option>+1</option>
                    <option>+255</option>
                    <option>+76</option>
                    <option>+40</option>
                  </select>
                  <input type="text" placeholder="Enter phone number" />
                </div>
              </div>

              <div className="Signupform-group">
                <label>Secondary Email</label>
                <input type="email" placeholder="admin@company.com" />
              </div>
            </div>

            <h3>Document Upload</h3>

            <div className="Signupupload-grid">
              <div
                className="Signupupload-box"
                onClick={() => documentRef.current.click()}
              >
                <input
                  type="file"
                  ref={documentRef}
                  style={{ display: "none" }}
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleDocumentChange}
                />

                {documentName ? (
                  <p className="file-selected">{documentName}</p>
                ) : (
                  <>
                    <div className="Signup-upload-icon">
                      <FiUpload size={28} />
                    </div>
                    <p>Click to upload or drag and drop</p>
                    <span>PDF, PNG, or JPG</span>
                  </>
                )}
              </div>

              <div
                className="Signupupload-box"
                onClick={() => logoRef.current.click()}
              >
                <input
                  type="file"
                  ref={logoRef}
                  style={{ display: "none" }}
                  accept=".png,.svg"
                  onChange={handleLogoChange}
                />

                {logoName ? (
                  <p className="file-selected">{logoName}</p>
                ) : (
                  <>
                    <div className="Signup-upload1-icon">
                      <FiUpload size={32} />
                    </div>
                    <p>Click to upload or drag and drop</p>
                    <span>Company Logo (PNG or SVG)</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="Signupsubmit-btn"
             >
              Continue
              <FaArrowRight style={{ marginLeft: "6px" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;