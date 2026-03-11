import React, { useEffect, useMemo, useState } from "react";
import "../css/Report.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
import { db } from "../firebase";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { FaBell, FaSearch, FaDownload, FaQuestionCircle } from "react-icons/fa";

const Report = () => {
  const [stats, setStats] = useState({});
  const [departments, setDepartments] = useState({});
  const [reports, setReports] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  const reportsPerPage = 4;

  useEffect(() => {
    const unsubStats = onSnapshot(collection(db, "stats"), (snapshot) => {
      if (!snapshot.empty) {
        setStats(snapshot.docs[0].data());
      } else {
        setStats({});
      }
    });

    const unsubDept = onSnapshot(collection(db, "departments"), (snapshot) => {
      if (!snapshot.empty) {
        setDepartments(snapshot.docs[0].data());
      } else {
        setDepartments({});
      }
    });

    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("generatedOn", "desc")
    );

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const reportData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportData);
    });

    return () => {
      unsubStats();
      unsubDept();
      unsubReports();
    };
  }, []);

  const monthlySpend = stats.monthlySpend ?? "0";
  const monthlySpendChange = stats.monthlySpendChange ?? "";
  const monthlySpendSubtext = stats.monthlySpendSubtext ?? "";

  const averageSalary = stats.averageSalary ?? "0";
  const averageSalaryChange = stats.averageSalaryChange ?? "";
  const averageSalarySubtext = stats.averageSalarySubtext ?? "";

  const engineering = useMemo(() => {
    const value = Number(departments.engineering);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  }, [departments.engineering]);

  const other = useMemo(() => {
    const value = Number(departments.other);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  }, [departments.other]);

  const total = departments.total ?? "0";

  const filteredReports = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) return reports;

    return reports.filter((report) => {
      const reportName = String(report.reportName || "").toLowerCase();
      const category = String(report.category || "").toLowerCase();
      const generatedOn = String(report.generatedOn || "").toLowerCase();

      return (
        reportName.includes(q) ||
        category.includes(q) ||
        generatedOn.includes(q)
      );
    });
  }, [reports, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, reports.length]);

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

  const monthlyChangeClass =
    String(monthlySpendChange).trim().startsWith("-")
      ? "trend-negative"
      : "trend-positive";

  const avgSalaryChangeClass =
    String(averageSalaryChange).trim().startsWith("-")
      ? "trend-negative"
      : "trend-positive";

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <div className="reports-topbar">
          <div className="reports-breadcrumb">
            REPORTS / <span>ACTIVITY</span>
          </div>

          <div className="reports-topbar-icons">
            <button className="top-icon-btn" type="button" aria-label="Notifications">
              <FaBell />
              <span className="notification-dot"></span>
            </button>

            <button className="top-icon-btn" type="button" aria-label="Help">
              <FaQuestionCircle />
            </button>
          </div>
        </div>

        <div className="reports-cards-row">
          <div className="report-stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">TOTAL MONTHLY SPEND</p>
              {monthlySpendChange ? (
                <span className={`stat-trend ${monthlyChangeClass}`}>
                  {monthlySpendChange}
                </span>
              ) : null}
            </div>

            <h2 className="stat-card-value">₹ {monthlySpend}</h2>

            {monthlySpendSubtext ? (
              <p className="stat-card-subtext">{monthlySpendSubtext}</p>
            ) : null}
          </div>

          <div className="report-stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">AVERAGE SALARY</p>
              {averageSalaryChange ? (
                <span className={`stat-trend ${avgSalaryChangeClass}`}>
                  {averageSalaryChange}
                </span>
              ) : null}
            </div>

            <h2 className="stat-card-value">₹ {averageSalary}</h2>

            {averageSalarySubtext ? (
              <p className="stat-card-subtext">{averageSalarySubtext}</p>
            ) : null}
          </div>
        </div>

        <div className="department-card">
          <h3 className="department-title">Department Headcount</h3>
          <p className="department-subtitle">Functional distribution</p>

          <div
            className="department-donut"
            style={{
              background: `conic-gradient(
                #2388ff 0% ${engineering}%,
                #7f8797 ${engineering}% 100%
              )`,
            }}
          >
            <div className="department-donut-inner">
              <span>{total}</span>
            </div>
          </div>

          <div className="department-bars">
            <div className="department-bar-item">
              <div className="department-bar-label-row">
                <span>Engineering</span>
                <span>{engineering}%</span>
              </div>
              <div className="department-bar-track">
                <div
                  className="department-bar-fill engineering-bar"
                  style={{ width: `${engineering}%` }}
                ></div>
              </div>
            </div>

            <div className="department-bar-item">
              <div className="department-bar-label-row">
                <span>Other Depts</span>
                <span>{other}%</span>
              </div>
              <div className="department-bar-track">
                <div
                  className="department-bar-fill other-bar"
                  style={{ width: `${other}%` }}
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
    onClick={() => {
      const headers = ["Report Name", "Category", "Generated On"];
      const values = [
        report.reportName || "-",
        report.category || "-",
        report.generatedOn || "-"
      ];

      const escapeCSV = (value) => {
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvContent = [
        headers.map(escapeCSV).join(","),
        values.map(escapeCSV).join(",")
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
    }}
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