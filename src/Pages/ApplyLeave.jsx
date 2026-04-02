import React, { useState } from "react";
import SidebarEmployee from "./SidebarEmployee";
import "../css/ApplyLeave.css";

import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  runTransaction,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

function ApplyLeave() {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in");
        return;
      }

      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User not found in users collection");
        return;
      }

      const userData = userSnap.data();

     
      const companyId =
        sessionStorage.getItem("companyId") ||
        userData.companyId ||
        "";

     
      const fullName =
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        userData.name ||
        "Employee";

      
      const empId =
        userData.employeeId && userData.employeeId !== ""
          ? userData.employeeId
          : user.uid;

     
      const counterRef = doc(db, "counters", "leaveCounter");

      const newLeaveId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          transaction.set(counterRef, { count: 1 });
          return "leave-001";
        }

        const current = counterDoc.data().count;
        const next = current + 1;

        transaction.update(counterRef, { count: next });

        return `leave-${String(next).padStart(3, "0")}`;
      });

     
      const start = new Date(fromDate);
      const end = new Date(toDate);

      const days =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      
      await setDoc(doc(db, "leave", newLeaveId), {
        uid: user.uid,

      
        employeeName: fullName,
        employeeId: empId,
        companyId: companyId,

        leaveType,
        fromDate: start,
        toDate: end,
        days: Math.max(days, 1),
        reason,
        status: "Pending",
        createdAt: serverTimestamp()
      });

      alert("Leave Applied ✅");

      
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");

    } catch (err) {
      console.error("Apply Leave Error:", err);
      alert("Error applying leave");
    }
  };

  return (
    <div className="main-layout">
      <SidebarEmployee />

      <div className="apply-leave-container">
        <h2>Apply Leave</h2>

        <form onSubmit={handleSubmit} className="leave-form">
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <option value="">Select Leave Type</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />

          <textarea
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeave;