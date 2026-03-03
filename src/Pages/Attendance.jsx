import React, { useEffect, useState } from "react";
import { FaCheck, FaClock, FaTimes, FaDownload } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../css/Attendance.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";

const Attendance = () => {

  const [attendanceData, setAttendanceData] = useState([]);

  // 🔥 Fetch Attendance Data from Firebase
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, []);


 const totalEmployees = attendanceData.length;

const onTimeCount = attendanceData.filter(
  (item) =>
    item.status &&
    item.status.toLowerCase().includes("on")
).length;

const lateCount = attendanceData.filter(
  (item) =>
    item.status &&
    item.status.toLowerCase().includes("late")
).length;

const absentCount = attendanceData.filter(
  (item) =>
    item.status &&
    item.status.toLowerCase().includes("absent")
).length;

const onTimePercentage =
  totalEmployees > 0
    ? ((onTimeCount / totalEmployees) * 100).toFixed(1)
    : 0;


  return (
    <div className="attendance-layout">
      <Sidebar />
      <div className="attendance-container">

        <div className="attendance-header">
          <div>
            <h2>Attendance</h2>
            <p>Track and manage employee clock-in records.</p>
          </div>
        </div>

        
       <div className="summary-cards">
        <div className="card">
        <div className="icon green">
        <FaCheck />
       </div>
        <h4>On Time</h4>
        <h2>{onTimePercentage}%</h2>
        <span>{onTimeCount} Employees</span>
        </div>

   <div className="card">
    <div className="icon yellow">
      <FaClock />
    </div>
    <h4>Late Arrivals</h4>
    <h2>{lateCount}</h2>
  </div>

  <div className="card">
    <div className="icon red">
      <FaTimes />
    </div>
    <h4>Absent</h4>
    <h2>{absentCount}</h2>
  </div>
</div>


       
        <div className="attendance-table-container">

          <div className="table-top">
            <div className="filters">
              <select>
                <option>All Department</option>
                <option>Sales</option>
                <option>HR</option>
                <option>IT</option>
              </select>

              <select>
                <option>All Shifts</option>
                <option>Morning-Shift</option>
                <option>Evening-Shift</option>
                <option>Night-Shift</option>
              </select>
            </div>

            <button className="export-btn">
              <FaDownload /> Export Log
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>CLOCK IN</th>
                <th>CLOCK OUT</th>
                <th>BREAK DURATION</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="employee-info">
                      <div className="avatar">
                        {item.name?.charAt(0)}
                      </div>
                      <div>
                        <p>{item.name}</p>
                        <span>ID: {item.employeeId}</span>
                      </div>
                    </div>
                  </td>
                  <td>{item.clockIn}</td>
                  <td>{item.clockOut}</td>
                  <td>{item.breakDuration}</td>
                  <td>
                    <span
                     className={`status ${
                     item.status?.toLowerCase().includes("Late")
                      ? "late"
                      : item.status?.toLowerCase().includes("absent")
                      ? "absent"
                     : "ontime"
                      }`}

                     >
                      {item.status}
                    </span>
                  </td>
                  <td>•••</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>
    </div>
  );
};

export default Attendance;
