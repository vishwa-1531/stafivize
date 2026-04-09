import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { onAuthStateChanged } from "firebase/auth";
import {  collection, onSnapshot, query, where,getDocs } from "firebase/firestore";
const Dashboard = () => {
  
  const [userName, setUserName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeave] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [range, setRange] = useState("7");


   const getStatusFromTime = (time) => {
    if (!time) return "Absent";

    try {
      const [t, modifier] = time.split(" ");
      let [h, m] = t.split(":").map(Number);

      if (modifier === "PM" && h !== 12) h += 12;
      if (modifier === "AM" && h === 12) h = 0;

      const total = h * 60 + m;

      const tenAM = 10 * 60;
      const tenFifteen = 10 * 60 + 15;
      const twelveThirty = 12 * 60 + 30;

      if (total >= tenAM && total <= tenFifteen) return "On Time";
      if (total > tenFifteen && total <= twelveThirty) return "Late";
      if (total > twelveThirty) return "Half Day";

      return "Absent";
    } catch {
      return "Absent";
    }
  };

  const normalizeDate = useCallback((value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    if (value instanceof Date) return value;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const formatShortDate = useCallback((date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

 const getTodayString = useCallback(() => {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}, []);
  const companyId = sessionStorage.getItem("companyId");


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUserName(
          `${data.firstName || ""} ${data.lastName || ""}`.trim()
        );
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  if (!companyId) return;

  
  const unsubEmployees = onSnapshot(
    query(
      collection(db, "employee"),
      where("companyId", "==", companyId)
    ),
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setEmployees(data);
    }
  );

  
  const unsubAttendance = onSnapshot(
    query(
      collection(db, "attendance"),
      where("companyId", "==", companyId)
    ),
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setAttendance(data);
    }
  );

  
  const unsubLeave = onSnapshot(
    query(
      collection(db, "leave"),
      where("companyId", "==", companyId)
    ),
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setLeave(data);
    }
  );

 
  const unsubPayroll = onSnapshot(
    query(
      collection(db, "payroll"),
      where("companyId", "==", companyId)
    ),
    (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));
      setPayroll(data);
    }
  );

  return () => {
    unsubEmployees();
    unsubAttendance();
    unsubLeave();
    unsubPayroll();
  };
}, [companyId]);
  const todayString = useMemo(() => getTodayString(), [getTodayString]);

  const totalEmployees = useMemo(() => employees.length, [employees]);

 const todayAttendanceRecords = useMemo(() => {
  return attendance.filter((item) => {
    // Case 1: If date is already string
    if (typeof item.date === "string") {
      const formatted = new Date(item.date).toISOString().split("T")[0];
      return formatted === todayString;
    }

    // Case 2: If timestamp
    const recordDate = normalizeDate(item.date || item.createdAt);
    return recordDate
      ? recordDate.toISOString().split("T")[0] === todayString
      : false;
  });
}, [attendance, normalizeDate, todayString]);
 const presentToday = useMemo(() => {
  const presentIds = new Set();

  todayAttendanceRecords.forEach((item) => {
   const status = String(
  item.checkInStatus || getStatusFromTime(item.checkIn)
)
      .trim()
      .toLowerCase();

    if (status === "on time" || status === "late" || status === "present") {
     presentIds.add(item.employeeId);
    }
  });

  return presentIds.size;
}, [todayAttendanceRecords]);


 const onLeaveToday = useMemo(() => {
  return leave.filter((item) => {
    const status = String(item.status || item.leaveStatus || "")
      .trim()
      .toLowerCase();

    const fromDate = normalizeDate(
      item.fromDate || item.startDate || item.leaveFrom || item.createdAt
    );

    const toDate = normalizeDate(
      item.toDate || item.endDate || item.leaveTo || item.createdAt
    );

    if (status !== "approved" && status !== "pending") return false;
    if (!fromDate || !toDate) return false;

    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

    return current >= start && current <= end;
  }).length;
}, [leave, normalizeDate]);
  const employeeGrowth = useMemo(() => {
    if (totalEmployees === 0) return "0%";

    const now = new Date();
    const last30Days = employees.filter((emp) => {
      const joinedDate = normalizeDate(emp.joinDate || emp.createdAt);
      if (!joinedDate) return false;

      const diff = now - joinedDate;
      const days = diff / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length;

    const percentage = Math.round((last30Days / totalEmployees) * 100);
    return `+${percentage}%`;
  }, [employees, totalEmployees, normalizeDate]);

  const attendanceRate = useMemo(() => {
    if (totalEmployees === 0) return "0%";
    return `${Math.round((presentToday / totalEmployees) * 100)}%`;
  }, [presentToday, totalEmployees]);

 const urgentLeaves = useMemo(() => {
  const pendingLeaves = leave.filter((item) => {
    const status = String(item.status || item.leaveStatus || "")
      .trim()
      .toLowerCase();

    return status === "pending";
  }).length;

  return `${pendingLeaves} Pending`;
}, [leave]);
  const currentMonthPayroll = useMemo(() => {
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const year = now.getFullYear();

    return payroll.filter((item) => {
      if (item.month) {
        const monthText = String(item.month).toLowerCase();
        return monthText.includes(monthName) && monthText.includes(String(year));
      }

      const createdAt = normalizeDate(item.createdAt);
      return createdAt
        ? createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
        : false;
    });
  }, [payroll, normalizeDate]);

  const payrollMonth = useMemo(() => {
    return new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
  }, []);

  const payrollStatus = useMemo(() => {
    if (totalEmployees === 0) return "No Data";
    if (currentMonthPayroll.length === 0) return "Pending";
    if (currentMonthPayroll.length >= totalEmployees) return "Completed";
    return "In Progress";
  }, [currentMonthPayroll.length, totalEmployees]);

  const attendanceChartData = useMemo(() => {
    const daysCount = Number(range);
    const result = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);

      const dayRecords = attendance.filter((item) => {
        const recordDate = normalizeDate(
          item.date || item.attendanceDate || item.createdAt
        );
        return recordDate
          ? recordDate.toDateString() === targetDate.toDateString()
          : false;
      });      

     const presentCount = dayRecords.filter((item) => {
 const status = String(
  item.checkInStatus || getStatusFromTime(item.checkIn)
)
    .trim()
    .toLowerCase();

  return status === "on time" || status === "late" || status === "present";
}).length;
      const percentage =
        totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

      result.push({
        label: daysCount === 7
          ? targetDate.toLocaleDateString("en-US", { weekday: "short" })
          : formatShortDate(targetDate),
        value: percentage
      });
    }

    return result;
  }, [attendance, totalEmployees, range, normalizeDate, formatShortDate]);

  const departmentStats = useMemo(() => {
    const total = employees.length;

    if (total === 0) {
      return {
        engineering: 0,
        sales: 0,
        marketing: 0,
        other: 0
      };
    }

    let engineering = 0;
    let sales = 0;
    let marketing = 0;
    let other = 0;

    employees.forEach((emp) => {
      const dept = String(emp.department || "").toLowerCase().trim();

      if (dept === "engineering" || dept === "it") {
        engineering += 1;
      } else if (dept === "sales") {
        sales += 1;
      } else if (dept === "marketing") {
        marketing += 1;
      } else {
        other += 1;
      }
    });

    return {
      engineering: Math.round((engineering / total) * 100),
      sales: Math.round((sales / total) * 100),
      marketing: Math.round((marketing / total) * 100),
      other: Math.round((other / total) * 100)
    };
  }, [employees]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="topbar">
          <div className="topbar-left">
            <h2>Dashboard Overview</h2>
            <p>Welcome back, {userName || "User"}. Here's what's happening today.</p>
          </div>
        </div>

        <div className="cards">
          <div className="card active-card">
            <span className="card-badge blue-badge">{employeeGrowth}</span>

            <div className="icon-box blue-bg">
              <FaUsers className="card-icon" />
            </div>

            <h4>Total Employee</h4>
            <h2>{totalEmployees}</h2>
          </div>

          <div className="card">
            <span className="card-badge green-badge">{attendanceRate}</span>

            <div className="icon-box green-bg">
              <FaUserCheck className="card-icon" />
            </div>

            <h4>Present Today</h4>
            <h2>{presentToday}</h2>
          </div>

          <div className="card">
            <span className="card-badge yellow-badge">{urgentLeaves}</span>

            <div className="icon-box yellow-bg">
              <FaUserTimes className="card-icon" />
            </div>

            <h4>On Leave</h4>
            <h2>{onLeaveToday}</h2>
          </div>

          <div className="card">
            <span className="card-badge blue-badge">{payrollMonth}</span>

            <div className="icon-box blue-bg">
              <FaShieldAlt className="card-icon" />
            </div>

            <h4>Payroll Status</h4>
            <h2>{payrollStatus}</h2>
          </div>
        </div>

        <div className="bottom-section">
          <div className="attendance">
            <div className="section-header">
              <h3>Attendance Trends</h3>

              <select
                className="dropdown"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>

            <div className="bars">
              {attendanceChartData.map((item, index) => (
                <div
                  key={index}
                  className="bar"
                  style={{ height: `${item.value}%` }}
                  title={`${item.label} - ${item.value}%`}
                ></div>
              ))}
            </div>

            <div className="days">
              {attendanceChartData.map((item, index) => (
                <span key={index}>{item.label}</span>
              ))}
            </div>
          </div>
      
          <div className="department">
            <h3>Department Distribution</h3>

            <div
              className="donut"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% ${departmentStats.engineering}%,
                  #10b981 ${departmentStats.engineering}% ${departmentStats.engineering + departmentStats.sales}%,
                  #facc15 ${departmentStats.engineering + departmentStats.sales}% ${departmentStats.engineering + departmentStats.sales + departmentStats.marketing}%,
                  #6b7280 ${departmentStats.engineering + departmentStats.sales + departmentStats.marketing}% 100%
                )`
              }}
            ></div>

            <div className="legend">
              <div><span className="dot blue"></span> Engineering {departmentStats.engineering}%</div>
              <div><span className="dot green"></span> Sales {departmentStats.sales}%</div>
              <div><span className="dot yellow"></span> Marketing {departmentStats.marketing}%</div>
              <div><span className="dot gray"></span> Other {departmentStats.other}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
