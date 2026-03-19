import React from "react";
import "../css/Review.css";
import { FaCheckCircle, FaArrowRight, FaArrowLeft, FaEdit } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { setDoc, doc, addDoc, collection } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase";
import logo from "../image/logo.png";

const Review = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  const handlePrevious = () => {
    navigate("/Admin", { state: data });
  };

  const handleFinish = async () => {
    try {
      if (!data.email || !data.password) {
        alert("Email or password is missing");
        return;
      }

      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      
      const companyData = {
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        industry: data.industry,
        companySize: data.companySize,
        createdAt: new Date()
      };

      const companyRef = await addDoc(collection(db, "companies"), companyData);

      
      const adminData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        idType: data.idType,
        idNumber: data.idNumber,
        companyId: companyRef.id,
        createdAt: new Date()
      };

      const adminRef = await addDoc(collection(db, "adminDetails"), adminData);

      
      await setDoc(
        doc(db, "companies", companyRef.id),
        {
          ...companyData,
          adminId: adminRef.id
        },
        { merge: true }
      );

      
      await setDoc(doc(db, "users", user.uid), {
        email: data.email,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        role: "Admin",
        companyId: companyRef.id,
        adminId: adminRef.id,
        profileImage: "",
        createdAt: new Date()
      });

      alert("Registration Completed Successfully");
      navigate("/Login");
    } catch (error) {
      console.error("Error saving data:", error);
      alert(error.message || "Error saving data");
    }
  };

  return (
    <div className="review-header">
      <div className="review-header-top">
        <img src={logo} alt="logo" className="reviewlogo-img" />
      </div>

      <div className="Signup-steps">
        <div className="step active">
          <div className="circle">1</div>
          <p>Company details</p>
        </div>

        <div className="step active">
          <div className="circle">2</div>
          <p>Admin details</p>
        </div>

        <div className="step active">
          <div className="circle">3</div>
          <p>Finish</p>
        </div>
      </div>

      <div className="review-container">
        <div className="review-card">
          <h2>Admin details</h2>
          <p className="subtitle">Provide your details to help us verify your account</p>

          <div className="review-check">
            <FaCheckCircle size={50} color="#22c55e" />
          </div>

          <h3 className="review-title">Review Your Details</h3>

          <div className="review-box">
            <div className="review-box-header">
              <h4>Company Details</h4>
              <span
                className="edit-btn"
                onClick={() => navigate("/SignUp", { state: data })}
              >
                <FaEdit /> Edit
              </span>
            </div>

            <div className="review-grid">
              <div>
                <p className="label">COMPANY NAME</p>
                <p>{data.companyName}</p>
              </div>

              <div>
                <p className="label">WEBSITE</p>
                <p>{data.companyWebsite}</p>
              </div>

              <div>
                <p className="label">INDUSTRY</p>
                <p>{data.industry}</p>
              </div>

              <div>
                <p className="label">COMPANY SIZE</p>
                <p>{data.companySize}</p>
              </div>
            </div>
          </div>

          <div className="review-box">
            <div className="review-box-header">
              <h4>Admin Details</h4>
              <span
                className="edit-btn"
                onClick={() => navigate("/Admin", { state: data })}
              >
                <FaEdit /> Edit
              </span>
            </div>

            <div className="review-grid">
              <div>
                <p className="label">FULL NAME</p>
                <p>{data.firstName} {data.lastName}</p>
              </div>

              <div>
                <p className="label">ADMIN EMAIL</p>
                <p>{data.email}</p>
              </div>

              <div>
                <p className="label">PHONE NUMBER</p>
                <p>{data.phone}</p>
              </div>

              <div>
                <p className="label">JOB TITLE</p>
                <p>{data.jobTitle}</p>
              </div>

              <div>
                <p className="label">ID VERIFICATION</p>
                <p>{data.idType} - {data.idNumber}</p>
              </div>
            </div>
          </div>

          <div className="warning-box">
            ✔ I certify that all information provided is accurate and truthful.
            Providing false information may result in suspension.
          </div>

          <div className="review-buttons">
            <button className="prev-btn" onClick={handlePrevious}>
              <FaArrowLeft /> Previous
            </button>

            <button className="finish-btn" onClick={handleFinish}>
              Finish Registration <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;