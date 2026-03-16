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
  query
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

  useEffect(() => {
    const employeeQuery = query(collection(db, "employee"));
    const leaveQuery = collection(db, "leave");

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
  }, []);

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

  const normalizeDate = (date) => {
    if (!date) return null;
    const parsed = date.toDate ? date.toDate() : new Date(date);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeStatus = (status) => {
    const value = String(status || "").trim().toLowerCase();

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

  const isPastLeave = (item) => {
  const start = normalizeDate(item.startDate || item.fromDate);
  if (!start) return false;

  const startOnly = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return startOnly < todayOnly;
};

const isTodayLeave = (item) => {
  const start = normalizeDate(item.startDate || item.fromDate);
  if (!start) return false;
  return start.toDateString() === today.toDateString();
};

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "leave", id), {
      status,
      approvedAt: new Date()
    });
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const getEmployeeName = (item, employee) => {
    if (item.employeeName) return item.employeeName;
    if (!employee) return "Unknown Employee";
    if (employee.fullName) return employee.fullName;

    const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
    return fullName || employee.name || "Unknown Employee";
  };
const getAppliedDate = (item) => {
  return (
    item.appliedOn ||
    item.createdAt ||
    item.appliedDate ||
    item.requestedAt ||
    null
  );
};
  const mergedLeave = useMemo(() => {
  return leave.map((item) => {
    const employee =
      employees.find(
        (emp) =>
          String(emp.employeeId || emp.id || "").trim().toLowerCase() ===
          String(item.employeeId || "").trim().toLowerCase()
      ) || employees.find((emp) => emp.id === item.employeeId);

    return {
      ...item,
      employeeName: getEmployeeName(item, employee),
      role: item.role || employee?.role || employee?.jobTitle || "-",
      avatar: item.avatar || employee?.profileImage || employee?.photoURL || "",
      department: item.department || employee?.department || "-",
      normalizedStatus: normalizeStatus(item.status),
      appliedDate: getAppliedDate(item)
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
    const d = normalizeDate(l.approvedAt);
    return d && d.toDateString() === today.toDateString();
  }).length;

 const upcomingLeaves = mergedLeave.filter((l) => {
  if (l.normalizedStatus !== "approved") return false;

  const start = normalizeDate(l.startDate || l.fromDate);
  if (!start) return false;

  const startOnly = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return startOnly >= todayOnly;
}).length;

  const exportCSV = () => {
    const headers = [
      "Employee",
      "Role",
      "Department",
      "Leave Type",
      "Start Date",
      "End Date",
      "Days",
      "Status"
    ];

    const rows = filteredLeave.map((l) => [
      l.employeeName || "-",
      l.role || "-",
      l.department || "-",
      l.leaveType || "-",
      formatDate(l.startDate),
      formatDate(l.endDate),
      l.days || 0,
      getStatusLabel(l.status)
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leave_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="leave-layout">
      <Sidebar />

      <div className="leave-content-right">
        <Topbar
  mainTitle="LEAVE"
  section="OVERVIEW"
  notifications={[
    { id: "1", text: `${leave.length} leave requests available` }
  ]}
  helpItems={[
    "Manage employee leave requests.",
    "Approve or reject pending requests.",
    "Use filters to check leave status."
  ]}
/>
        <div className="leave-header">
          <div>
            <h2>Leave Management</h2>
            <p>Review, approve, and track employee leave applications.</p>
          </div>
        </div>

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

        <div className="table-section">
          <div className="table-top">
            <div className="tabs">
              <button
                className={filter === "All" ? "active" : ""}
                onClick={() => setFilter("All")}
              >
                All
              </button>
              <button
                className={filter === "Pending" ? "active" : ""}
                onClick={() => setFilter("Pending")}
              >
                Pending
              </button>
              <button
                className={filter === "Approved" ? "active" : ""}
                onClick={() => setFilter("Approved")}
              >
                Approved
              </button>
              <button
                className={filter === "Rejected" ? "active" : ""}
                onClick={() => setFilter("Rejected")}
              >
                Rejected
              </button>
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
              {filteredLeave.length > 0 ? (
                filteredLeave.map((item) => (
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
                      {item.leaveType || "-"}
                    </td>

                   <td>
  {formatDate(item.startDate || item.fromDate)} - {formatDate(item.endDate || item.toDate)}
  <div className="applied">
    Applied on {formatDate(item.appliedDate)}
  </div>
</td>
                    <td>{item.days || 0} days</td>

                    <td>
                      <span className={`status ${item.normalizedStatus}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    <td className="actions">
                      <button
                        className="approve"
                        onClick={() => updateStatus(item.id, "Approved")}
                        disabled={item.normalizedStatus !== "pending" || isPastLeave(item)}
                      >
                        ✔
                      </button>

                      <button
                        className="reject"
                        onClick={() => updateStatus(item.id, "Rejected")}
                        disabled={item.normalizedStatus !== "pending" || isPastLeave(item)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave; 