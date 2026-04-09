import React, { useEffect, useMemo, useState } from "react";
import { FaCheck, FaClock, FaTimes, FaDownload, FaCalendarAlt } from "react-icons/fa";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../css/Attendance.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../css/Topbar.css";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const companyId = sessionStorage.getItem("companyId");
  const [view, setView] = useState("weekly");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [departmentFilter, setDepartmentFilter] = useState("All Department");
  const [shiftFilter, setShiftFilter] = useState("All Shifts");

  

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  



useEffect(() => {
  if (!companyId) return; 

  const attendanceQuery = query(
    collection(db, "attendance"),
    where("companyId", "==", companyId), 
    orderBy("date", "desc")
  );

  const unsubAttendance = onSnapshot(attendanceQuery, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setAttendanceData(data);
  });

  const employeeQuery = query(
    collection(db, "employee"),
    where("companyId", "==", companyId) 
  );

  const unsubEmployee = onSnapshot(employeeQuery, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setEmployeeData(data);
  });

  return () => {  
    unsubAttendance();
    unsubEmployee();
  };
}, [companyId]); 

 const normalizeDate = (value) => {
  if (!value) return null;

 
  if (value?.toDate) return value.toDate();

  
  if (typeof value === "string") {
    const parts = value.split("-");
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]); 
    }
  }

  if (value instanceof Date) return value;

  return null;
};
  

  const formatDate = (value) => {
    const date = normalizeDate(value);
    if (!date) return "-";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";

    if (value?.toDate) {
      return value.toDate().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    if (value instanceof Date) {
      return value.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }

    return typeof value === "string" ? value : "-";
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const getMonthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const getWeeksInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const weeks = [];
    const firstDay = new Date(year, month, 1);
    firstDay.setHours(0, 0, 0, 0);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());

    while (true) {
      const start = new Date(firstDay);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      weeks.push({ start, end });
      firstDay.setDate(firstDay.getDate() + 7);

      if (firstDay.getMonth() !== month && firstDay.getDate() > 7) {
        break;
      }
    }

    return weeks;
  };

  const weeks = getWeeksInMonth();

  const employeeMap = useMemo(() => {
    const map = {};

    employeeData.forEach((emp) => {
      if (emp.employeeId) {
        map[String(emp.employeeId).trim()] = emp;
      }
    });

    return map;
  }, [employeeData]);

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

 const mergedAttendance = useMemo(() => {
  return attendanceData.map((item) => {
    const employee =
      employeeMap[String(item.employeeId || "").trim()] || {};

    const checkIn = item.checkIn;
    const checkOut = item.checkOut;
   
    return {
      ...item,
      checkIn,
      checkOut,

    checkInStatus: item.checkInStatus || getStatusFromTime(item.checkIn),
      checkoutStatus: item.checkoutStatus || "-", 

      name: employee.name || employee.fullName || "N/A",
      department: employee.department || "N/A",
      role: employee.role || "N/A",
      email: employee.email || "N/A"
    };
  });
}, [attendanceData, employeeMap]);
  const departmentOptions = useMemo(() => {
    const depts = mergedAttendance
      .map((item) => item.department)
      .filter((value) => value && value !== "N/A");

    return ["All Department", ...new Set(depts)];
  }, [mergedAttendance]);

  const shiftOptions = useMemo(() => {
    const shifts = mergedAttendance
      .map((item) => item.shift)
      .filter(Boolean);

    return ["All Shifts", ...new Set(shifts)];
  }, [mergedAttendance]);

  const filteredAttendance = useMemo(() => {
    return mergedAttendance.filter((item) => {
      const itemDate = normalizeDate(item.date || item.createdAt || item.attendanceDate);

      let matchesDate = true;
      if (itemDate) {
        if (view === "daily") {
          matchesDate = isSameDay(itemDate, currentDate);
        } else if (view === "weekly") {
          const { start, end } = getWeekRange(currentDate);
          matchesDate = itemDate >= start && itemDate <= end;
        } else if (view === "monthly") {
          const { start, end } = getMonthRange(currentDate);
          matchesDate = itemDate >= start && itemDate <= end;
        }
      }

      const matchesDepartment =
        departmentFilter === "All Department" ||
        item.department === departmentFilter;

      const matchesShift =
        shiftFilter === "All Shifts" ||
        item.shift === shiftFilter;

      return matchesDate && matchesDepartment && matchesShift;
    });
  }, [mergedAttendance, currentDate, view, departmentFilter, shiftFilter]);

  const totalEmployees = filteredAttendance.length;

  const onTimeCount = filteredAttendance.filter(
    (item) => item.checkInStatus?.trim().toLowerCase() === "on time"
  ).length;

  const lateCount = filteredAttendance.filter(
    (item) => item.checkInStatus?.trim().toLowerCase() === "late"
  ).length;

  const absentCount = filteredAttendance.filter(
    (item) => item.checkInStatus?.trim().toLowerCase() === "absent"
  ).length;

  const onTimePercentage =
    totalEmployees > 0
      ? ((onTimeCount / totalEmployees) * 100).toFixed(1)
      : 0;

  const exportCSV = () => {
    const headers = [
      "Name",
      "Employee ID",
      "Department",
      "Date",
      "Shift",
      "Clock In",
      "Clock Out",
      "CheckOut Status",
      "CheckIN Status"
    ];

    const rows = filteredAttendance.map((emp) => [
      emp.name || "",
      emp.employeeId || "",
      emp.department || "",
      formatDate(emp.date || emp.attendanceDate || emp.createdAt),
      emp.shift || "",
      formatTime(emp.checkIn),
      formatTime(emp.checkOut),
      emp.checkInStatus || "",
      emp.checkoutStatus || ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((value) => `"${value}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateRange = () => {
    const date = new Date(currentDate);

    if (view === "daily") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }

    if (view === "weekly") {
      const { start, end } = getWeekRange(date);
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })}`;
    }

    if (view === "monthly") {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });
    }

    return "";
  };

  const getInitials = (name = "") => {
    const cleanName = String(name).trim();
    if (!cleanName) return "--";

    const words = cleanName.split(" ").filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };
  

  return (
    <div className="attendance-layout">
      <Sidebar />

      <div className="attendance-container">
        <Topbar
          mainTitle="ATTENDANCE"
          section="OVERVIEW"
          notifications={[
            { id: "1", text: `${attendanceData.length} attendance records loaded` }
          ]}
          helpItems={[
            "View employee attendance records.",
            "Track daily and monthly attendance.",
            "Use filters to find employee records quickly."
          ]}
        />

        <div className="attendance-header">
          <div className="attendance-title">
            <h2>Attendance</h2>
            <p>Track and manage employee clock-in records.</p>
          </div>

          <div className="attendance-controls">
            <div className="view-switch">
              <button
                className={view === "daily" ? "active" : ""}
                onClick={() => {
                  setView("daily");
                  setCurrentDate(new Date());
                }}
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

              <div className="divider"></div>

              {view === "monthly" ? (
                <select
                  className="month-dropdown"
                  value={currentDate.getMonth()}
                  onChange={(e) => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(Number(e.target.value));
                    newDate.setDate(1);
                    setCurrentDate(newDate);
                  }}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month} {currentDate.getFullYear()}
                    </option>
                  ))}
                </select>
              ) : view === "weekly" ? (
                <select
                  className="week-dropdown"
                  value={weeks.findIndex(
                    (week) => currentDate >= week.start && currentDate <= week.end
                  )}
                  onChange={(e) => {
                    const week = weeks[Number(e.target.value)];
                    setCurrentDate(new Date(week.start));
                  }}
                >
                  {weeks.map((week, index) => (
                    <option key={index} value={index}>
                      {week.start.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })} -{" "}
                      {week.end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="date-display">
                  <FaCalendarAlt /> {formatDateRange()}
                </div>
              )}
            </div>
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
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departmentOptions.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
              >
                {shiftOptions.map((shift, index) => (
                  <option key={index} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <button className="export-btn" onClick={exportCSV}>
              <FaDownload /> Export Log
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DATE</th>
                <th>CLOCK IN</th>
                <th>CLOCK OUT</th>
                <th>CheckIn Status</th>
                <th>CheckOut  Status</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="employee-info">
                        <div className="avatar">
                          {getInitials(item.name)}
                        </div>

                        <div>
                          <p>{item.name || "N/A"}</p>
                          <span>ID: {item.employeeId || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(item.date || item.attendanceDate || item.createdAt)}</td>
                    <td>{formatTime(item.checkIn)}</td>
                    <td>{formatTime(item.checkOut)}</td>
                   

                    <td>
                      <span
                        className={`checkInStatus ${
                          item.checkInStatus?.trim().toLowerCase() === "late"
                            ? "late"
                            : item.checkInStatus?.trim().toLowerCase() === "absent"
                            ? "absent"
                            : item.checkInStatus?.trim().toLowerCase() === "on time"
                            ? "ontime"
                            : ""
                        }`}
                      >
                        {item.checkInStatus || "N/A"}
                      </span>
                    </td>
                   <td>
                <span
                 className={`checkoutstatus ${
                  item.checkoutStatus === "Early Leave"
                  ? "late"
                  : item.checkoutStatus === "Completed"
                  ? "ontime"
                 : item.checkoutStatus === "Overtime"
                  ? "overtime"
                  : ""
                  }`}
                 >
                 {item.checkoutStatus || "-"}
                 </span>
                 </td>

                <td className="action-cell">
                  <button
                  className="action-btn"
                  onClick={() => alert(`Employee ID: ${item.employeeId}`)}
                  >
                  •••
                 </button>
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
};

export default Attendance;