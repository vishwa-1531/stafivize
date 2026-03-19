import React, { useState } from "react";
import "../css/Employee.css";
import "../css/Sidebar.css";
import "../css/Topbar.css";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db, secondaryAuth } from "../firebase";

const AddEmp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    status: "Active",
    joinDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Generate EMP-001 style ID (NO duplicate)
  const generateEmployeeId = async () => {
    const snapshot = await getDocs(collection(db, "employee"));

    let max = 0;

    snapshot.forEach((doc) => {
      const id = doc.data().employeeId;
      if (id) {
        const num = parseInt(id.split("-")[1]);
        if (num > max) max = num;
      }
    });

    return `EMP-${String(max + 1).padStart(3, "0")}`;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const employeeId = await generateEmployeeId(); 
      const name = formData.name.trim();
      const email = formData.email.trim();
      const password = formData.password;
      const department = formData.department.trim();
      const designation = formData.designation.trim();
      const role = "Employee";
      const status = formData.status;
      const joinDate = formData.joinDate;

      
      if (!name || !email || !password || !department || ! designation|| !joinDate) {
        setMessage("Please fill all required fields");
        setLoading(false);
        return;
      }

      
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      
      await setDoc(doc(db, "employee", employeeId), {
        uid,
        employeeId,
        name,
        email,
        department,
        designation,
        role,
        status,
        joinDate,
        createdAt: serverTimestamp()
      });

      
      await setDoc(doc(db, "users", uid), {
        uid,
        name,
        email,
        role,
        createdAt: serverTimestamp()
      });

      setMessage(`Employee added successfully ✅ (${employeeId})`);

      
      setFormData({
        name: "",
        email: "",
        password: "",
        department: "",
        designation :"",
        status: "Active",
        joinDate: ""
      });

      // ✅ Redirect
      setTimeout(() => {
        navigate("/employee");
      }, 1000);
    } catch (error) {
      console.error("Error adding employee:", error);

      if (error.code === "auth/email-already-in-use") {
        setMessage("This email is already in use");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setMessage("Password must be at least 6 characters");
      } else {
        setMessage("Failed to add employee");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-layout">
      <Sidebar />

      <div className="employee-content">
        <Topbar
          mainTitle="ADD EMPLOYEE"
          section="DIRECTORY"
          notifications={[
            { id: "1", text: "Create employee account and profile" }
          ]}
          helpItems={[
            "Fill all employee details.",
            "Email and password will be used for login.",
            "Employee ID is auto-generated.",
            "Employee data will be stored in Firebase."
          ]}
        />

        <div className="employee-topbar">
          <div className="employee-topbar-left">
            <h2>Add New Employee</h2>
            <p>Create login account and employee profile.</p>
          </div>

          <div className="employee-topbar-right">
            <button
              className="employee-btn"
              onClick={() => navigate("/employee")}
            >
              Back
            </button>
          </div>
        </div>

        <div className="table-container" style={{ padding: "24px" }}>
          <form className="add-employee-form" onSubmit={handleAddEmployee}>
            <div className="form-grid">

            

              <input
                type="text"
                name="name"
                placeholder="Employee Name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Employee Email"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
              />

              <input
                type="text"
                name="designation"
                placeholder="Designation"
                value={formData.designation}
                onChange={handleChange}
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="DeActive">DeActive</option>
              </select>

              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="submit"
                className="employee-btn"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>

            {message && (
              <p style={{ marginTop: "15px", fontWeight: "500" }}>
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmp;