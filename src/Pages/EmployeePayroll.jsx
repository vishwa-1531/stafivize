import React, { useEffect, useState } from "react";
import SidebarEmployee from "./SidebarEmployee";
import "../css/EmployeePayroll.css";

import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { FaRupeeSign, FaArrowUp, FaClock } from "react-icons/fa";

function EmployeePayroll() {
  const [user, setUser] = useState(null);
  const [payroll, setPayroll] = useState([]);

  // 🔥 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔥 FETCH PAYROLL (REALTIME + COMPANY FILTER)
  useEffect(() => {
    if (!user) return;

    const companyId = sessionStorage.getItem("companyId");

    const q = query(
      collection(db, "payroll"),
      where("uid", "==", user.uid),
      where("companyId", "==", companyId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setPayroll(list);
    });

    return () => unsub();
  }, [user]);

  // 🔥 CALCULATIONS
  const latest = payroll[0] || {};
  const totalEarned = payroll.reduce(
    (sum, p) => sum + (p.netSalary || 0),
    0
  );

  return (
    <div style={{ display: "flex" }}>
      <SidebarEmployee />

      <div className="employee-payroll-container">
        {/* HEADER */}
        <div className="employee-payroll-header">
          <h2>My Payroll</h2>

          <button className="employee-payroll-download-btn">
            ⬇ Download Payslips
          </button>
        </div>

        {/* CARDS */}
        <div className="employee-payroll-cards">
          <div className="employee-payroll-card">
            <FaRupeeSign className="payroll-icon blue" />
            <p>Latest Net Pay</p>
            <h3>
              {latest.netSalary ? `₹${latest.netSalary}` : "-"}
            </h3>
          </div>

          <div className="employee-payroll-card">
            <FaArrowUp className="payroll-icon green" />
            <p>Total Earned</p>
            <h3>₹{totalEarned}</h3>
          </div>

          <div className="employee-payroll-card">
            <FaClock className="payroll-icon yellow" />
            <p>Base Salary</p>
            <h3>
              {latest.baseSalary ? `₹${latest.baseSalary}` : "-"}
            </h3>
          </div>
        </div>

        {/* TABLE */}
        <div className="employee-payroll-table">
          <h4>Payslip History</h4>

          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Base Salary</th>
                <th>Bonus</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payroll.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No payslips found.
                  </td>
                </tr>
              ) : (
                payroll.map((p) => (
                  <tr key={p.id}>
                    <td>{p.month}</td>
                    <td>₹{p.baseSalary || 0}</td>
                    <td>₹{p.bonus || 0}</td>
                    <td>₹{p.deduction || 0}</td>
                    <td>₹{p.netSalary || 0}</td>
                    <td>
                      <span className="employee-payroll-status paid">Paid</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeePayroll;