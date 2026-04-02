import React, { useEffect, useMemo, useState } from "react";
import "../css/Leave.css";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../css/Topbar.css";
import { db } from "../firebase";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where
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
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("All");

  const today = new Date();
  const companyId = sessionStorage.getItem("companyId");

  useEffect(() => {
    if (!companyId) return;

    const employeeQuery = query(
      collection(db, "employee"),
      where("companyId", "==", companyId)
    );

    const leaveQuery = query(
      collection(db, "leave"),
      where("companyId", "==", companyId)
    );

    const unsubEmployees = onSnapshot(employeeQuery, (snapshot) => {
      const employeeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);
    });

    const unsubLeave = onSnapshot(leaveQuery, (snapshot) => {
      const leaveData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      leaveData.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);

        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);

        return dateB - dateA;
      });

      setLeave(leaveData);
    });

    return () => {
      unsubEmployees();
      unsubLeave();
    };
  }, [companyId]);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = date.toDate ? date.toDate() : new Date(date);
    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const normalizeStatus = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";
    return "pending";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";
    return "Pending";
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "leave", id), {
      status,
      approvedAt: new Date()
    });
  };

  // ✅ SAFE INITIALS
  const getInitials = (name) => {
    if (!name || name === "-") return "";
    const parts = name.trim().split(" ");
    return (
      (parts[0]?.[0] || "") +
      (parts[1]?.[0] || "")
    ).toUpperCase();
  };

  // ✅ FIXED MERGE (MAIN ISSUE FIXED HERE)
  const mergedLeave = useMemo(() => {
    return leave.map((item) => {
      const employee =
        employees.find(
          (emp) =>
            emp.employeeId === item.employeeId ||
            emp.uid === item.uid
        ) || null;

      let employeeName = "";

      // 🔥 PRIORITY 1: if leave has name and not empty
      if (item.employeeName && item.employeeName.trim() !== "") {
        employeeName = item.employeeName;
      }

      // 🔥 PRIORITY 2: get from employee collection
      else if (employee) {
        employeeName =
          employee.fullName ||
          employee.name ||
          `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
      }

      // 🔥 FINAL fallback
      if (!employeeName || employeeName.trim() === "") {
        employeeName = "-";
      }

      return {
        ...item,
        employeeName,

        role:
          employee?.designation ||
          employee?.jobTitle ||
          "Employee",

        avatar:
          employee?.profileImage || "",

        normalizedStatus: normalizeStatus(item.status)
      };
    });
  }, [leave, employees]);

  const filteredLeave = mergedLeave.filter((item) => {
    if (filter === "All") return true;
    return item.normalizedStatus === filter.toLowerCase();
  });

  const pendingRequests = mergedLeave.filter(
    (l) => l.normalizedStatus === "pending"
  ).length;

  const approvedToday = mergedLeave.filter((l) => {
    if (l.normalizedStatus !== "approved" || !l.approvedAt) return false;
    const d = l.approvedAt?.toDate?.() || new Date(l.approvedAt);
    return d.toDateString() === today.toDateString();
  }).length;

  const upcomingLeaves = mergedLeave.filter((l) => {
    if (l.normalizedStatus !== "approved") return false;
    const start = l.fromDate?.toDate?.() || new Date(l.fromDate);
    return start >= today;
  }).length;

  const exportCSV = () => {
    const headers = ["Employee", "Leave Type", "Start", "End", "Days", "Status"];

    const rows = filteredLeave.map((l) => [
      l.employeeName,
      l.leaveType,
      formatDate(l.fromDate),
      formatDate(l.toDate),
      l.days,
      getStatusLabel(l.status)
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "leave.csv";
    link.click();
  };

  return (
    <div className="leave-layout">
      <Sidebar />

      <div className="leave-content-right">
        <Topbar mainTitle="LEAVE" section="OVERVIEW" />

        <div className="leave-header">
          <h2>Leave Management</h2>
          <p>Review, approve, and track employee leave applications.</p>
        </div>

        {/* ✅ YOUR ICON CARDS KEPT */}
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
            <h2>{mergedLeave.length}</h2>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-section">
          <div className="table-top">
            <div className="tabs">
              {["All", "Pending", "Approved", "Rejected"].map((t) => (
                <button
                  key={t}
                  className={filter === t ? "active" : ""}
                  onClick={() => setFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <button className="export-btn" onClick={exportCSV}>
              <FaFileExport /> Export
            </button>
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
              {filteredLeave.map((item) => (
                <tr key={item.id}>
                  <td className="employee">
                    <div className="emp-info">
                      <div className="avatar-circle">
                        {getInitials(item.employeeName)}
                      </div>

                      <div>
                        <p>{item.employeeName}</p>
                        <span>{item.role}</span>
                      </div>
                    </div>
                  </td>

                  <td>{item.leaveType}</td>

                  <td>
                    {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                  </td>

                  <td>{item.days} days</td>

                  <td>
                    <span className={`status ${item.normalizedStatus}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>

                  <td className="actions">
                    <button
                      className="approve"
                      onClick={() => updateStatus(item.id, "Approved")}
                      disabled={item.normalizedStatus !== "pending"}
                    >
                      ✔
                    </button>

                    <button
                      className="reject"
                      onClick={() => updateStatus(item.id, "Rejected")}
                      disabled={item.normalizedStatus !== "pending"}
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