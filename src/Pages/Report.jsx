import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../css/Report.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import {
  FaBell,
  FaSearch,
  FaDownload,
  FaQuestionCircle
} from "react-icons/fa";

const Report = () => {
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeave] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const reportsPerPage = 4;

  const getEmployeeDetails = (employeeId) => {
    const employee = employees.find(
      (emp) =>
        String(emp.employeeId || emp.id || "").trim().toLowerCase() ===
        String(employeeId || "").trim().toLowerCase()
    );

    if (!employee) {
      return {
        employeeId: employeeId || "-",
        employeeName: "-",
        department: "-",
        role: "-"
      };
    }

    return {
      employeeId: employee.employeeId || employeeId || "-",
      employeeName:
        employee.name ||
        employee.employeeName ||
        employee.fullName ||
        "-",
      department: employee.department || "-",
      role: employee.role || "-"
    };
  };

  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, "employee"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(data);
    });

    const unsubPayroll = onSnapshot(collection(db, "payroll"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayroll(data);
    });

    const unsubAttendance = onSnapshot(collection(db, "attendance"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendance(data);
    });

    const unsubLeave = onSnapshot(collection(db, "leave"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeave(data);
    });

    const reportsQuery = query(
      collection(db, "report"),
      orderBy("createdAt", "desc")
    );

    const unsubReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setReports(data);
      },
      () => {
        setReports([]);
      }
    );

    return () => {
      unsubEmployees();
      unsubPayroll();
      unsubAttendance();
      unsubLeave();
      unsubReports();
    };
  }, []);

  const normalizeDate = useCallback((value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    if (value instanceof Date) return value;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, []);

  const formatDate = useCallback(
    (value) => {
      const date = normalizeDate(value);
      if (!date) return "-";

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    },
    [normalizeDate]
  );

  const currentDateInfo = useMemo(() => {
    const today = new Date();

    return {
      today,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      currentMonthName: today.toLocaleString("en-US", { month: "long" }).toLowerCase()
    };
  }, []);

  const currentMonthPayroll = useMemo(() => {
    return payroll.filter((item) => {
      if (item.month) {
        const monthText = String(item.month).toLowerCase();
        return (
          monthText.includes(currentDateInfo.currentMonthName) &&
          monthText.includes(String(currentDateInfo.currentYear))
        );
      }

      const createdAt = normalizeDate(item.createdAt);
      return createdAt
        ? createdAt.getMonth() === currentDateInfo.currentMonth &&
            createdAt.getFullYear() === currentDateInfo.currentYear
        : false;
    });
  }, [payroll, currentDateInfo, normalizeDate]);

  const monthlySpend = useMemo(() => {
    return currentMonthPayroll.reduce((sum, item) => {
      return (
        sum +
        Number(item.baseSalary || 0) +
        Number(item.bonus || 0) -
        Number(item.deduction || 0)
      );
    }, 0);
  }, [currentMonthPayroll]);

  const averageSalary = useMemo(() => {
    if (employees.length === 0) return 0;

    const total = employees.reduce((sum, emp) => {
      return sum + Number(emp.basicSalary || 0);
    }, 0);

    return Math.round(total / employees.length);
  }, [employees]);

  const departmentStats = useMemo(() => {
    const totalEmployees = employees.length;

    if (totalEmployees === 0) {
      return {
        engineering: 0,
        other: 0,
        total: 0
      };
    }

    const engineeringCount = employees.filter((emp) => {
      const department = String(emp.department || "").toLowerCase();
      return department === "it" || department === "engineering";
    }).length;

    const otherCount = totalEmployees - engineeringCount;

    return {
      engineering: Math.round((engineeringCount / totalEmployees) * 100),
      other: Math.round((otherCount / totalEmployees) * 100),
      total: totalEmployees
    };
  }, [employees]);

  const attendanceCount = useMemo(() => attendance.length, [attendance]);
  const leaveCount = useMemo(() => leave.length, [leave]);

  const notifications = useMemo(() => {
    const items = [];

    if (attendanceCount > 0) {
      items.push({
        id: "attendance-alert",
        text: `${attendanceCount} attendance records available`
      });
    }

    if (leaveCount > 0) {
      items.push({
        id: "leave-alert",
        text: `${leaveCount} leave records available`
      });
    }

    if (currentMonthPayroll.length > 0) {
      items.push({
        id: "payroll-alert",
        text: `${currentMonthPayroll.length} payroll records found for this month`
      });
    }

    if (reports.length > 0) {
      items.push({
        id: "reports-alert",
        text: `${reports.length} report records loaded`
      });
    }

    if (items.length === 0) {
      items.push({
        id: "empty-alert",
        text: "No new notifications"
      });
    }

    return items;
  }, [attendanceCount, leaveCount, currentMonthPayroll.length, reports.length]);

  const generatedReports = useMemo(() => {
    return [
      {
        id: "auto-payroll",
        reportName: "Monthly Payroll Summary",
        category: `Payroll (${currentMonthPayroll.length})`,
        generatedOn: formatDate(currentDateInfo.today),
        createdAt: currentDateInfo.today
      },
      {
        id: "auto-attendance",
        reportName: "Attendance Summary",
        category: `Attendance (${attendanceCount})`,
        generatedOn: formatDate(currentDateInfo.today),
        createdAt: currentDateInfo.today
      },
      {
        id: "auto-leave",
        reportName: "Leave Summary",
        category: `Leave (${leaveCount})`,
        generatedOn: formatDate(currentDateInfo.today),
        createdAt: currentDateInfo.today
      }
    ];
  }, [
    currentMonthPayroll.length,
    attendanceCount,
    leaveCount,
    formatDate,
    currentDateInfo
  ]);

  const normalizedReports = useMemo(() => {
    if (reports.length > 0) {
      return reports.map((item) => ({
        id: item.id,
        reportName: item.reportName || item.title || "Untitled Report",
        category: item.category || item.reportType || "General",
        generatedOn: item.generatedOn || formatDate(item.createdAt),
        createdAt: item.createdAt || null
      }));
    }

    return generatedReports;
  }, [reports, generatedReports, formatDate]);

  const filteredReports = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) return normalizedReports;

    return normalizedReports.filter((report) => {
      const reportName = String(report.reportName || "").toLowerCase();
      const category = String(report.category || "").toLowerCase();
      const generatedOn = String(report.generatedOn || "").toLowerCase();

      return (
        reportName.includes(q) ||
        category.includes(q) ||
        generatedOn.includes(q)
      );
    });
  }, [normalizedReports, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, normalizedReports.length]);

  useEffect(() => {
    if (showAll) return;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, showAll]);

  const displayedReports = useMemo(() => {
    if (showAll) return filteredReports;

    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, showAll]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setShowAll(false);
  };

  const handleViewAll = () => {
    setShowAll(true);
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (showAll) return;
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    if (showAll) return;
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

 const handleBellClick = () => {
  setShowNotifications((prev) => !prev);
  setShowHelp(false);

  // when user opens notifications → remove red dot
  setHasUnreadNotifications(false);
};

  const handleHelpClick = () => {
    setShowHelp((prev) => !prev);
    setShowNotifications(false);
  };

  const downloadReport = (report) => {
    const escapeCSV = (value) => {
      const stringValue = String(value ?? "-");

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    const category = String(report.category || "").toLowerCase();

    let headers = [];
    let rows = [];

    if (category.includes("attendance")) {
      headers = [
        "Employee ID",
        "Employee Name",
        "Department",
        "Role",
        "Date",
        "Status"
      ];

      rows = attendance.map((item) => {
        const employee = getEmployeeDetails(item.employeeId);

        return [
          employee.employeeId,
          employee.employeeName,
          employee.department,
          employee.role,
          formatDate(item.date || item.createdAt),
          item.status || "-"
        ];
      });
    } else if (category.includes("leave")) {
      headers = [
        "Employee ID",
        "Employee Name",
        "Department",
        "Role",
        "Leave Type",
        "From Date",
        "To Date",
        "Status"
      ];

      rows = leave.map((item) => {
        const employee = getEmployeeDetails(item.employeeId);

        return [
          employee.employeeId,
          employee.employeeName,
          employee.department,
          employee.role,
          item.leaveType || "-",
          formatDate(item.fromDate || item.startDate),
          formatDate(item.toDate || item.endDate),
          item.status || "-"
        ];
      });
    } else if (category.includes("payroll")) {
      headers = [
        "Employee ID",
        "Employee Name",
        "Department",
        "Role",
        "Base Salary",
        "Bonus",
        "Deduction",
        "Net Salary"
      ];

      rows = currentMonthPayroll.map((item) => {
        const employee = getEmployeeDetails(item.employeeId);

        const baseSalary = Number(item.baseSalary || 0);
        const bonus = Number(item.bonus || 0);
        const deduction = Number(item.deduction || 0);
        const netSalary = baseSalary + bonus - deduction;

        return [
          employee.employeeId,
          employee.employeeName,
          employee.department,
          employee.role,
          baseSalary,
          bonus,
          deduction,
          netSalary
        ];
      });
    } else {
      headers = ["Report Name", "Category", "Generated On"];
      rows = [[
        report.reportName || "-",
        report.category || "-",
        report.generatedOn || "-"
      ]];
    }

    if (rows.length === 0) {
      rows = [headers.map(() => "-")];
    }

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `${(report.reportName || "report").replace(/[^a-z0-9]/gi, "_")}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="reports-topbar">
          <div className="reports-breadcrumb">
            REPORTS / <span>ACTIVITY</span>
          </div>

          <div className="reports-topbar-icons">
            <div className="topbar-icon-wrapper">
              <button
                className="top-icon-btn"
                type="button"
                aria-label="Notifications"
                onClick={handleBellClick}
              >
                <FaBell />
                {hasUnreadNotifications && (
  <span className="notification-dot"></span>
)}
              </button>

              {showNotifications && (
                <div className="topbar-dropdown notifications-dropdown">
                  <h4>Notifications</h4>
                  {notifications.map((item) => (
                    <p key={item.id}>{item.text}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="topbar-icon-wrapper">
              <button
                className="top-icon-btn"
                type="button"
                aria-label="Help"
                onClick={handleHelpClick}
              >
                <FaQuestionCircle />
              </button>

              {showHelp && (
                <div className="topbar-dropdown help-dropdown">
                  <h4>Help</h4>
                  <p>Use the search box to find reports faster.</p>
                  <p>Click VIEW ALL to see every report.</p>
                  <p>Click the download icon to export a CSV file.</p>
                  <p>Attendance and Leave reports fetch employee details using Employee ID.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="reports-cards-row">
          <div className="report-stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">TOTAL MONTHLY SPEND</p>
            </div>

            <h2 className="stat-card-value">₹ {monthlySpend.toLocaleString()}</h2>
            <p className="stat-card-subtext">Calculated from payroll records</p>
          </div>

          <div className="report-stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">AVERAGE SALARY</p>
            </div>

            <h2 className="stat-card-value">₹ {averageSalary.toLocaleString()}</h2>
            <p className="stat-card-subtext">Calculated from employee collection</p>
          </div>
        </div>

        <div className="department-card">
          <h3 className="department-title">Department Headcount</h3>
          <p className="department-subtitle">Functional distribution</p>

          <div
            className="department-donut"
            style={{
              background: `conic-gradient(
                #2388ff 0% ${departmentStats.engineering}%,
                #7f8797 ${departmentStats.engineering}% 100%
              )`
            }}
          >
            <div className="department-donut-inner">
              <span>{departmentStats.total}</span>
            </div>
          </div>

          <div className="department-bars">
            <div className="department-bar-item">
              <div className="department-bar-label-row">
                <span>Engineering</span>
                <span>{departmentStats.engineering}%</span>
              </div>
              <div className="department-bar-track">
                <div
                  className="department-bar-fill engineering-bar"
                  style={{ width: `${departmentStats.engineering}%` }}
                ></div>
              </div>
            </div>

            <div className="department-bar-item">
              <div className="department-bar-label-row">
                <span>Other Depts</span>
                <span>{departmentStats.other}%</span>
              </div>
              <div className="department-bar-track">
                <div
                  className="department-bar-fill other-bar"
                  style={{ width: `${departmentStats.other}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="reports-table-card">
          <div className="reports-table-header">
            <h3>Recent Reports</h3>

            <div className="reports-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search analytics..."
                value={searchText}
                onChange={handleSearchChange}
              />
            </div>

            <button className="view-all-btn" type="button" onClick={handleViewAll}>
              VIEW ALL
            </button>
          </div>

          <div className="reports-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>REPORT NAME</th>
                  <th>CATEGORY</th>
                  <th>GENERATED ON</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {displayedReports.length > 0 ? (
                  displayedReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.reportName || "-"}</td>
                      <td>{report.category || "-"}</td>
                      <td>{report.generatedOn || "-"}</td>
                      <td>
                        <button
                          className="download-btn"
                          type="button"
                          aria-label="Download"
                          onClick={() => downloadReport(report)}
                        >
                          <FaDownload className="download-icon" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data-row">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="reports-table-footer">
            <p>
              {showAll
                ? `Showing all ${filteredReports.length} reports`
                : `Showing ${displayedReports.length} of ${filteredReports.length} reports`}
            </p>

            <div className="reports-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={handlePrevious}
                disabled={showAll || currentPage === 1}
              >
                Previous
              </button>

              <button
                type="button"
                className="pagination-btn"
                onClick={handleNext}
                disabled={showAll || currentPage === totalPages || filteredReports.length === 0}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;