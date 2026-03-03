import React, { useEffect, useState } from "react";
import "../css/Leave.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaUniversity,
} from "react-icons/fa";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const Leave = () => {
  const [leave, setLeave] = useState([]);

  
  const [formData, setFormData] = useState({
    employeeName: "",
    leaveType: "",
    startDate: "",
    endDate: "",
  });

  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;

    return diffDays > 0 ? diffDays : 0;
  };

  
  const fetchLeave = async () => {
    const querySnapshot = await getDocs(collection(db, "leave"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLeave(data);
  };

  useEffect(() => {
    fetchLeave();
  }, []);


  const addLeave = async () => {
    if (
      !formData.employeeName ||
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill all fields");
      return;
    }

    await addDoc(collection(db, "leave"), {
      ...formData,
      days: calculateDays(),
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    
    setFormData({
      employeeName: "",
      leaveType: "",
      startDate: "",
      endDate: "",
    });

    fetchLeave();
  };

  
  const updateStatus = async (id, newStatus) => {
    const leaveRef = doc(db, "leave", id);
    await updateDoc(leaveRef, {
      status: newStatus,
    });

    fetchLeave();
  };

  return (
    <div className="leave-layout">
      <Sidebar />

      <div className="leave-content-right">
        <div className="leave-header">
          <div>
            <h2>Leave Management</h2>
            <p>Review, approve, and track employee leave applications.</p>
          </div>
        </div>

        
        <div className="leave-form">
          <input
            type="text"
            name="employeeName"
            placeholder="Employee Name"
            value={formData.employeeName}
            onChange={handleChange}
          />

          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
          >
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Paid Leave">Paid Leave</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />

          <button className="apply-btn" onClick={addLeave}>
            Submit
          </button>
        </div>

       
        <div className="stats-container">
          <div className="stat-card">
            <FaClock className="icon yellow" />
            <h4>Pending Requests</h4>
            <h2>{leave.filter((l) => l.status === "Pending").length}</h2>
          </div>

          <div className="stat-card">
            <FaCheckCircle className="icon green" />
            <h4>Approved</h4>
            <h2>{leave.filter((l) => l.status === "Approved").length}</h2>
          </div>

          <div className="stat-card">
            <FaCalendarAlt className="icon blue" />
            <h4>Total Leaves</h4>
            <h2>{leave.length}</h2>
          </div>

          <div className="stat-card">
            <FaUniversity className="icon purple" />
            <h4>Remaining Balance</h4>
           
          </div>
        </div>

        
        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leave.map((item) => (
                <tr key={item.id}>
                  <td>{item.employeeName}</td>
                  <td>{item.leaveType}</td>
                  <td>
                    {item.startDate} - {item.endDate}
                  </td>
                  <td>{item.days}</td>
                  <td>
                    <span className={`status ${item.status?.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => updateStatus(item.id, "Approved")}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;