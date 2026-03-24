import React, { useEffect, useState } from "react";
import SidebarEmployee from "./SidebarEmployee";
import "../css/SidebarEmployee.css";
import "../css/EmployeeDashboard.css";

import {
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaRupeeSign,
  FaUsers
} from "react-icons/fa";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  runTransaction
} from "firebase/firestore";

function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState({});
  const [attendance, setAttendance] = useState(null);
  const [daysPresent, setDaysPresent] = useState(0);

  const getToday = () => new Date().toISOString().split("T")[0];

  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsub();
  }, []);

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "employee"),
      where("uid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setEmployee(snapshot.docs[0].data());
      }
    });

    return () => unsub();
  }, [user]);

 
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    const unsub = onSnapshot(ref, (docSnap) => {
      if (docSnap.exists()) {
        setEmployee((prev) => ({
          ...prev,
          name: docSnap.data().name
        }));
      }
    });

    return () => unsub();
  }, [user]);

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "attendance"),
      where("uid", "==", user.uid),
      where("date", "==", getToday())
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const docData = snapshot.docs[0];
        setAttendance({
          id: docData.id,
          ...docData.data()
        });
      } else {
        setAttendance(null);
      }
    });

    return () => unsub();
  }, [user]);

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "attendance"),
      where("uid", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.filter((doc) =>
        doc.data().date.startsWith(getToday().slice(0, 7))
      ).length;

      setDaysPresent(count);
    });

    return () => unsub();
  }, [user]);

  
  const handleCheckIn = async () => {
  if (!user) return;

  try {
    const now = new Date();

    const hour = now.getHours();
    const minute = now.getMinutes();

    const status =
      hour > 9 || (hour === 9 && minute > 30)
        ? "Late"
        : "On Time";

    // ✅ If already checked in → update status
    if (attendance) {
      await updateDoc(doc(db, "attendance", attendance.id), {
        status: status
      });
      return;
    }

    const counterRef = doc(db, "counters", "attendance");

    const newId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        transaction.set(counterRef, { count: 1 });
        return "Attendance-001";
      }

      const currentCount = counterDoc.data().count;
      const nextCount = currentCount + 1;

      transaction.update(counterRef, { count: nextCount });

      return `Attendance-${String(nextCount).padStart(3, "0")}`;
    });

    await setDoc(doc(db, "attendance", newId), {
      uid: user.uid,
      name: employee.name || "",
      employeeId: employee.employeeId || "",
      date: getToday(),

      checkIn: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),

      status: status
    });

  } catch (error) {
    console.error("Check-In Error:", error);
  }
};
  
  const handleCheckOut = async () => {
    if (!attendance || attendance.checkOut) return;

    const ref = doc(db, "attendance", attendance.id);

    await updateDoc(ref, {
      checkOut: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="employeedashboard-container">
      <SidebarEmployee />

      <div className="employeedashboard-content">
        <h1>My Dashboard</h1>

        <p className="welcome-text">
          {employee.name ? `Welcome back, ${employee.name}!` : "Loading..."}
        </p>

        
        <div className="employeeattendance-card">
          <div className="attendance-left">
            <h3>Today's Attendance</h3>

            <p className="attendance-date">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long"
              })}
            </p>

            {!attendance?.checkIn ? (
              <p className="not-checked">Not checked in yet</p>
            ) : (
              <>
                <p className="checkin-text">
                  Checked in at {attendance.checkIn}
                </p>

                {attendance?.checkOut && (
                  <p className="checkout-text">
                    Checked out at {attendance.checkOut}
                  </p>
                )}
              </>
            )}

            <p className="shift">Shift 09:00 - 18:00 (grace: 15min)</p>
          </div>

          <div className="attendance-right">
            <button
              className="checkin"
              onClick={handleCheckIn}
              disabled={attendance?.checkIn}
            >
              Check In
            </button>

            <button
              className="checkout"
              onClick={handleCheckOut}
              disabled={!attendance || attendance?.checkOut}
            >
              Check Out
            </button>
          </div>
        </div>

       
        <div className="employeedashboard-cards">
          <div className="employeedashboard-card">
            <FaCalendarAlt className="employeedashboard-icon blue" />
            <p className="tag">This Month</p>
            <h4>Days Present</h4>
            <h2>{daysPresent}</h2>
          </div>

          <div className="employeedashboard-card">
            <FaUmbrellaBeach className="employeedashboard-icon yellow" />
            <p className="tag yellow-tag">
              Remaining : {employee.leavesRemaining || 0}
            </p>
            <h4>Approved Leaves</h4>
            <h2>{employee.leavesUsed || 0}</h2>
          </div>

          <div className="employeedashboard-card">
            <FaRupeeSign className="employeedashboard-icon red" />
            <p className="tag red-tag">Latest</p>
            <h4>Net Pay</h4>
            <h2>{employee.salary || "-"}</h2>
          </div>

          <div className="employeedashboard-card">
            <FaUsers className="employeedashboard-icon green" />
            <p className="tag green-tag">Profile</p>
            <h4>Department</h4>
            <h2>{employee.department || "-"}</h2>
          </div>
        </div>

        
        <div className="employeedashboard-recent">
          <h3>Recent Leave Requests</h3>
          <p className="empty">No leave requests yet.</p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;