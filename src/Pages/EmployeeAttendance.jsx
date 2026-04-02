import React, { useEffect, useState } from "react";
import SidebarEmployee from "./SidebarEmployee";
import "../css/SidebarEmployee.css";
import "../css/EmployeeAttendance.css";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaCalendarAlt, FaUmbrellaBeach, FaRupeeSign, FaUsers } from "react-icons/fa";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  runTransaction,
  
} from "firebase/firestore";

function EmployeeAttendance() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState({});
  const [attendance, setAttendance] = useState(null);
  const [allAttendance, setAllAttendance] = useState([]);
  const [view, setView] = useState("daily");
const [currentDate, setCurrentDate] = useState(new Date());

  const getToday = () => new Date().toISOString().split("T")[0];

 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "employee"),
      where("uid", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setEmployee(snap.docs[0].data());
      }
    });
  }, [user]);

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "attendance"),
      where("uid", "==", user.uid),
      where("date", "==", getToday())
    );

    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setAttendance({
          id: snap.docs[0].id,
          ...snap.docs[0].data()
        });
      } else {
        setAttendance(null);
      }
    });
  }, [user]);

  
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "attendance"),
      where("uid", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => doc.data());
      setAllAttendance(data);
    });
  }, [user]);

  
  const handleCheckIn = async () => {
    if (!user || attendance) return;

    const now = new Date();

   const hour = now.getHours();
const minutes = now.getMinutes();
const totalMinutes = hour * 60 + minutes;

const tenAM = 10 * 60;
const tenFifteen = 10 * 60 + 15;
const twelveThirty = 12 * 60 + 30;

if (totalMinutes < tenAM) {
  alert("Check-in allowed after 10:00 AM");
  return;
}

let checkInStatus = "";

if (totalMinutes >= tenAM && totalMinutes <= tenFifteen) {
 checkInStatus = "On Time";
} else if (totalMinutes > tenFifteen && totalMinutes <= twelveThirty) {
  checkInStatus= "Late";
} else {
  checkInStatus = "Half Day";
}
    const counterRef = doc(db, "counters", "attendance");

    const newId = await runTransaction(db, async (t) => {
      const docSnap = await t.get(counterRef);

      if (!docSnap.exists()) {
        t.set(counterRef, { count: 1 });
        return "Attendance-001";
      }

      const next = docSnap.data().count + 1;
      t.update(counterRef, { count: next });
   
      return `Attendance-${String(next).padStart(3, "0")}`;
    });

    await setDoc(doc(db, "attendance", newId), {
      uid: user.uid,
      name: employee.name || "",
      employeeId: employee.employeeId || "",
      companyId: employee.companyId || "", 
      date: getToday(),
      checkIn: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }),
      checkInStatus:checkInStatus
    });
  };

  
 const handleCheckOut = async () => {
  if (!attendance || attendance.checkOut) return;

  const now = new Date();

  const hour = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hour * 60 + minutes;

  const fivePM = 17 * 60;
  const sixPM = 18 * 60;

  let checkoutStatus = "";

  if (totalMinutes < fivePM) {
     checkoutStatus = "Early Leave";
  } else if (totalMinutes >= fivePM && totalMinutes < sixPM) {
     checkoutStatus = "Completed";
  } else {
     checkoutStatus = "Overtime";
  }

  await updateDoc(doc(db, "attendance", attendance.id), {
    checkOut: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }),
     checkoutStatus:  checkoutStatus
  });
};
  
  const daysPresent = allAttendance.filter((item) =>
  item.date?.startsWith(getToday().slice(0, 7))
).length;
  const filteredAttendance = allAttendance.filter((item) => {
  if (!item.date) return false;

  const itemDate = new Date(item.date);
  const today = new Date();

  if (view === "daily") {
    return item.date === getToday();
  }

  if (view === "weekly") {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return itemDate >= start && itemDate <= end;
  }

  if (view === "monthly") {
    return (
      itemDate.getMonth() === currentDate.getMonth() &&
      itemDate.getFullYear() === currentDate.getFullYear()
    );
  }

  return true;     
});
  return (
    <div className="employeedashboard-container">
      <SidebarEmployee />

      <div className="employee-attendance-container">

       
        <div className="employee-attendance-header">
          <div>
            <h2>My Attendance</h2>
            <p>Track your attendance records.</p>
          </div>

          <div className="employee-attendance-actions">
            <button
              className="employee-checkin-btn"
              onClick={handleCheckIn}
              disabled={attendance?.checkIn}
            >
              Check In
            </button>

            <button
              className="employee-checkout-btn"
              onClick={handleCheckOut}
              disabled={!attendance || attendance?.checkOut}
            >
              Check Out
            </button>
          </div>
        </div>

        <div className="employee-attendance-controls">

  <div className="view-switch">
    <button
      className={view === "daily" ? "active" : ""}
      onClick={() => setView("daily")}
    >
      Daily
    </button>

    <button
      className={view === "weekly" ? "active" : ""}
      onClick={() => setView("weekly")}
    >
      Weekly
    </button>

    <button
      className={view === "monthly" ? "active" : ""}
      onClick={() => setView("monthly")}
    >
      Monthly
    </button>
  </div>

  <select
    className="employee-month-dropdown"
    value={currentDate.getMonth()}
    onChange={(e) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(Number(e.target.value));
      setCurrentDate(newDate);
    }}
  >
    {Array.from({ length: 12 }).map((_, i) => (
      <option key={i} value={i}>
        {new Date(currentDate.getFullYear(), i).toLocaleString("default", {
          month: "long"
        })}{" "}
        {currentDate.getFullYear()}
      </option>
    ))}
  </select>

</div>

        
      <div className="employee-attendance-cards">

       <div className="card-1">
       <div className="card-top">
        <FaCalendarAlt className="card-icon blue" />

       
    <span className="tag blue-tag">This Month</span>
    <h4>Days Present</h4>
    <h2>{daysPresent}</h2>
    </div>
  </div>

  <div className="card-2">
    <div className="card-top">
      <FaUmbrellaBeach className="card-icon yellow" />
    
    <span className="tag yellow-tag">Remaining : {employee.leavesRemaining || 0}</span>
    <h4>Approved Leaves</h4>
    <h2>{employee.leavesUsed || 0}</h2>
    </div>
  </div>

  <div className="card-3">
    <div className="card-top">
      <FaRupeeSign className="card-icon red" />
    <span className="tag red-tag">Latest</span>
    <h4>Net Pay</h4>
    <h2>{employee.salary || "-"}</h2>
    </div>
  </div>

  <div className="card-4">
    <div className="card-top">
     <FaUsers className="card-icon green" />
    <span className="tag green-tag">Profile</span>
    <h4>Department</h4>
    <h2>{employee.department || "-"}</h2>
  </div>
   
    </div>
</div>
        
        <div className="employee-attendance-table">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>CHECK IN</th>
                <th>CHECK OUT</th>
                <th>CHECKIN STATUS</th>
                 <th>CHECKOUT STATUS</th>

              </tr>
            </thead>

            <tbody>
              {allAttendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((item, i) => (
                  <tr key={i}>
                    <td>{item.date}</td>
                    <td>{item.checkIn}</td>
                    <td>{item.checkOut || "-"}</td>
                    <td>{item.checkInStatus}</td>
                    <td>{item.checkoutStatus}</td>

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

export default EmployeeAttendance;