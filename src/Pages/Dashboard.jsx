import React, { useEffect, useState } from "react";
import "../css/Dashboard.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";

import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaShieldAlt
} from "react-icons/fa";

import { auth, db } from "../firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";

const Dashboard = () => {

  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({});
  const [attendance, setAttendance] = useState({});
  const [departments, setDepartments] = useState({});

  /* ================= USER ================= */

  useEffect(() => {

    const fetchUser = async () => {
      const user = auth.currentUser;

      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.firstName + " " + data.lastName);
        }
      }
    };

    fetchUser();

  }, []);

  /* ================= DASHBOARD STATS ================= */

  useEffect(() => {

    const unsubStats = onSnapshot(
      collection(db, "dashboardStats"),
      (snapshot) => {
        if (!snapshot.empty) {
          setStats(snapshot.docs[0].data());
        }
      }
    );

    const unsubAttendance = onSnapshot(
      collection(db, "attendance"),
      (snapshot) => {
        if (!snapshot.empty) {
          setAttendance(snapshot.docs[0].data());
        }
      }
    );

    const unsubDept = onSnapshot(
      collection(db, "departments"),
      (snapshot) => {
        if (!snapshot.empty) {
          setDepartments(snapshot.docs[0].data());
        }
      }
    );

    return () => {
      unsubStats();
      unsubAttendance();
      unsubDept();
    };

  }, []);

  return (

    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">

        {/* Top Section */}

        <div className="topbar">
          <div className="topbar-left">

            <h2>Dashboard Overview</h2>
            <p>Welcome back, {userName}. Here's what's happening today.</p>

          </div>
        </div>

        {/* Cards */}

        <div className="cards">

          <div className="card active-card">
            <span className="card-badge blue-badge">{stats.employeeGrowth}</span>

            <div className="icon-box blue-bg">
              <FaUsers className="card-icon" />
            </div>

            <h4>Total Employee</h4>
            <h2>{stats.totalEmployees}</h2>
          </div>

          <div className="card">
            <span className="card-badge green-badge">{stats.attendanceRate}</span>

            <div className="icon-box green-bg">
              <FaUserCheck className="card-icon" />
            </div>

            <h4>Present Today</h4>
            <h2>{stats.presentToday}</h2>
          </div>

          <div className="card">
            <span className="card-badge yellow-badge">{stats.urgentLeaves}</span>

            <div className="icon-box yellow-bg">
              <FaUserTimes className="card-icon" />
            </div>

            <h4>On Leave</h4>
            <h2>{stats.onLeave}</h2>
          </div>

          <div className="card">
            <span className="card-badge blue-badge">{stats.payrollMonth}</span>

            <div className="icon-box blue-bg">
              <FaShieldAlt className="card-icon" />
            </div>

            <h4>Payroll Status</h4>
            <h2>{stats.payrollStatus}</h2>
          </div>

        </div>

        {/* Bottom Section */}

        <div className="bottom-section">

          {/* Attendance */}

          <div className="attendance">

            <div className="section-header">
              <h3>Attendance Trends</h3>

              <select className="dropdown">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>

            </div>

            <div className="bars">
              <div className="bar" style={{ height: attendance.mon + "%" }}></div>
              <div className="bar" style={{ height: attendance.tue + "%" }}></div>
              <div className="bar" style={{ height: attendance.wed + "%" }}></div>
              <div className="bar" style={{ height: attendance.thu + "%" }}></div>
              <div className="bar" style={{ height: attendance.fri + "%" }}></div>
              <div className="bar" style={{ height: attendance.sat + "%" }}></div>
              <div className="bar" style={{ height: attendance.sun + "%" }}></div>
            </div>

            <div className="days">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

          </div>

          {/* Department */}

          <div className="department">

            <h3>Department Distribution</h3>

            <div
              className="donut"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% ${departments.engineering}%,
                  #10b981 ${departments.engineering}% ${departments.engineering + departments.sales}%,
                  #facc15 ${departments.engineering + departments.sales}% ${departments.engineering + departments.sales + departments.marketing}%,
                  #6b7280 ${departments.engineering + departments.sales + departments.marketing}% 100%
                )`
              }}
            ></div>

            <div className="legend">
              <div><span className="dot blue"></span> Engineering {departments.engineering}%</div>
              <div><span className="dot green"></span> Sales {departments.sales}%</div>
              <div><span className="dot yellow"></span> Marketing {departments.marketing}%</div>
              <div><span className="dot gray"></span> Other {departments.other}%</div>
            </div>

          </div>

        </div>

      </div>
    </div>

  );
};

export default Dashboard;