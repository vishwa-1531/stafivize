import React, { useEffect, useState } from "react";
import SidebarEmployee from "./SidebarEmployee";
import "../css/EmployeeLeaves.css";

import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { FaClock, FaCheckCircle, FaCalendarAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function EmployeeLeaves() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [leaves, setLeaves] = useState([]);

  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState(20);

  // 🔥 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔥 FETCH LEAVES (FINAL FIXED LOGIC)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "leave"),
      where("uid", "==", user.uid) // ✅ ONLY FILTER (IMPORTANT)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      // ✅ SORT manually (no index error)
      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      setLeaves(list);

      // ✅ COUNTS
      const pendingCount = list.filter(
        (l) => (l.status || "").toLowerCase() === "pending"
      ).length;

      const approvedCount = list.filter(
        (l) => (l.status || "").toLowerCase() === "approved"
      ).length;

      setPending(pendingCount);
      setApproved(approvedCount);

      // ✅ BALANCE CALCULATION
      setLeaveBalance(20 - approvedCount);

      // 🔍 DEBUG (optional)
      console.log("LEAVES DATA:", list);
    });

    return () => unsub();
  }, [user]);

  // 🔥 DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "-";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <SidebarEmployee />

      <div className="employee-leave-container">
        {/* HEADER */}
        <div className="employee-leave-header">
          <div>
            <h2>My Leaves</h2>
            <p>Leaves Balance: {leaveBalance} days remaining</p>
          </div>

          <button
            className="leave-apply-btn"
            onClick={() => navigate("/ApplyLeave")}
          >
            <FaPlus /> Apply Leave
          </button>
        </div>

        {/* CARDS */}
        <div className="employee-leave-cards">
          <div className="employee-leave-card">
            <FaClock className="leave-icon pending" />
            <h4>Pending</h4>
            <h2>{pending}</h2>
          </div>

          <div className="employee-leave-card">
            <FaCheckCircle className="leave-icon approved" />
            <h4>Approved</h4>
            <h2>{approved}</h2>
          </div>

          <div className="employee-leave-card">
            <FaCalendarAlt className="leave-icon balance" />
            <h4>Leave Balance</h4>
            <h2>{leaveBalance}</h2>
          </div>
        </div>

        {/* TABLE */}
        <div className="employee-leave-table">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Remaining Balance</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No leave requests yet.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td>{l.leaveType || "-"}</td>
                    <td>
                      {formatDate(l.fromDate)} - {formatDate(l.toDate)}
                    </td>
                    <td>{l.days || "-"}</td>
                    <td>{l.reason || "-"}</td>
                    <td>{leaveBalance}</td>
                    <td>
                      <span
                        className={`status ${(l.status || "")
                          .toLowerCase()}`}
                      >
                        {l.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="leave-pagination">
            <button>Prev</button>
            <button>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLeaves;