import React, { useEffect, useState } from "react";
import "../css/Leave.css";
import Sidebar from "./Sidebar";
import { db } from "../firebase";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import {
  FaClock,
  FaCheckCircle,
  FaCalendarAlt,
  FaUniversity,
  FaFileExport
} from "react-icons/fa";

const Leave = () => {
  const [leave, setLeave] = useState([]);
  const [filter, setFilter] = useState("All");

  const today = new Date();

  useEffect(() => {
    const q = query(collection(db, "leave"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeave(data);
    });
    return () => unsub();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Disable action buttons if leave is in the past
  const isPastLeave = (item) => {
    if (!item.startDate) return false;
    const start = item.startDate.toDate ? item.startDate.toDate() : new Date(item.startDate);
    return start < today;
  };

  // Check if leave starts today
  const isTodayLeave = (item) => {
    if (!item.startDate) return false;
    const start = item.startDate.toDate ? item.startDate.toDate() : new Date(item.startDate);
    return start.toDateString() === today.toDateString();
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "leave", id), {
      status: status,
      approvedAt: new Date()
    });
  };

  const filteredLeave = leave.filter(item => {
    if (filter === "All") return true;
    return item.status === filter;
  });

  const pendingRequests = leave.filter(l => l.status === "Pending").length;

  const approvedToday = leave.filter(l => {
    if (l.status !== "Approved" || !l.approvedAt) return false;
    const d = l.approvedAt.toDate ? l.approvedAt.toDate() : new Date(l.approvedAt);
    return d.toDateString() === today.toDateString();
  }).length;

  const upcomingLeaves = leave.filter(l => {
    if (!l.startDate) return false;
    const start = l.startDate.toDate ? l.startDate.toDate() : new Date(l.startDate);
    return start > today;
  }).length;

  const exportCSV = () => {
    const headers = ["Employee", "Role", "Leave Type", "Start Date", "End Date", "Days", "Status"];
    const rows = filteredLeave.map(l => [
      l.employeeName,
      l.role,
      l.leaveType,
      formatDate(l.startDate),
      formatDate(l.endDate),
      l.days,
      l.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leave_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

  return (
    <div className="leave-layout">
      <Sidebar />

      <div className="leave-content-right">
        {/* HEADER */}
        <div className="leave-header">
          <h2>Leave Management</h2>
          <p>Review, approve, and track employee leave applications.</p>
        </div>

        {/* STATS */}
        <div className="stats-container">
          <div className="stat-card">
            <FaClock className="icon yellow" />
            <h4>Pending Requests</h4>
            <h2>{pendingRequests}</h2>
          </div>

          <div className="stat-card">
            <FaCheckCircle className="icon green" />
            <h4>Approved Today</h4>
            <h2>{approvedToday}</h2>
          </div>

          <div className="stat-card">
            <FaCalendarAlt className="icon blue" />
            <h4>Upcoming Leaves</h4>
            <h2>{upcomingLeaves}</h2>
          </div>

          <div className="stat-card">
            <FaUniversity className="icon purple" />
            <h4>Total Leave Requests</h4>
            <h2>{leave.length}</h2>
          </div>
        </div>

        {/* FILTERS & EXPORT */}
        

        {/* TABLE */}
        <div className="table-section">
          <div className="table-top">
          <div className="tabs">
            <button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>All</button>
            <button className={filter === "Pending" ? "active" : ""} onClick={() => setFilter("Pending")}>Pending</button>
            <button className={filter === "Approved" ? "active" : ""} onClick={() => setFilter("Approved")}>Approved</button>
            <button className={filter === "Rejected" ? "active" : ""} onClick={() => setFilter("Rejected")}>History</button>
          </div>
          <button className="export-btn" onClick={exportCSV}><FaFileExport /> Export </button>
        </div>
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
              {filteredLeave.map(item => (
                <tr
                  key={item.id}
                  className={isTodayLeave(item) ? "highlight-today" : ""}
                >
                  <td className="employee">
                    <div className="emp-info">
                     {item.avatar ? (
  <img src={item.avatar} alt={item.employeeName} />
) : (
  <div className="avatar-initials">
    {getInitials(item.employeeName)}
  </div>
)}
                      <div>
                        <p className="emp-name">{item.employeeName}</p>
                        <span className="emp-role">{item.role}</span>
                      </div>
                    </div>
                  </td>

                  <td className="leave-type">
                    <span className="leave-dot"></span>
                    {item.leaveType}
                  </td>

                  <td>
                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    <div className="applied">Applied on {formatDate(item.createdAt)}</div>
                  </td>

                  <td>{item.days} days</td>

                  <td>
                    <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
                  </td>

                  <td className="actions">
                    <button
                      className="approve"
                      onClick={() => updateStatus(item.id, "Approved")}
                      disabled={item.status !== "Pending" || isPastLeave(item)}
                    >
                      ✔
                    </button>
                    <button
                      className="reject"
                      onClick={() => updateStatus(item.id, "Rejected")}
                      disabled={item.status !== "Pending" || isPastLeave(item)}
                    >
                      ✖
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