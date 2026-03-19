import React, { useState, useEffect } from "react";
import "../css/Employee.css";
import "../css/Sidebar.css";
import "../css/Topbar.css";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEllipsisV } from "react-icons/fa";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Employee = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterdesignation, setFilterdesignation] = useState("");

  const handleOpenProfile = (employeeId) => {
    navigate(`/employee-profile/${employeeId}`);
  };

  useEffect(() => {
    const q = query(collection(db, "employee"), orderBy("joinDate", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeeList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    return (
      ((emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDept ? emp.department === filterDept : true) &&
      (filterStatus ? emp.status === filterStatus : true) &&
      (filterdesignation ? emp.designation === filterdesignation : true)
    );
  });

  const departments = [
    ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
  ];
  const statuses = [
    ...new Set(employees.map((emp) => emp.status).filter(Boolean)),
  ];
  const designation = [...new Set(employees.map((emp) => emp.designation).filter(Boolean))];

  return (
    <div className="employee-layout">
      <Sidebar />

      <div className="employee-content">
         <Topbar
  mainTitle="EMPLOYEE"
  section="DIRECTORY"
  notifications={[
    { id: "1", text: `${employees.length} employees loaded` }
  ]}
  helpItems={[
    "View all employees.",
    "Search by name, role, or department.",
    "Open employee profile for more details."
  ]}
/>
        <div className="employee-topbar">
         
          <div className="employee-topbar-left">
            <h2>Employee Activity</h2>
            <p>Real-time presence and directory management.</p>
          </div>

          <div className="employee-topbar-right">
            <button
              className="employee-btn"
              onClick={() => navigate("/addemp")}
            >
              +ADD Employee
            </button>
          </div>
        </div>

        <div className="filters-container">
          <div className="filters-box">
            <span className="filters-title">FILTERS</span>

           <div className="search-box">
  <FaSearch className="search-icon" />
  <input
    type="text"
    placeholder="Search by name or email..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

            <select
              className="filter-select"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="">Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filterdesignation}
              onChange={(e) => setFilterdesignation(e.target.value)}
            >
              <option value="">Designation</option>
              {designation.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>Designation</th>
                <th>STATUS</th>
                <th>JOIN DATE</th>
                
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6">No employees found</td>
                </tr>
              ) : (
filteredEmployees.map((emp) => (
  <tr key={emp.id}>
    <td>{emp.name || "-"}</td>
    <td>{emp.department || "-"}</td>
    <td>{emp.designation|| "-"}</td>

    <td className="status-cell">
      <div className="status-cell-inner">
        <span
          className={`status-badge ${
            emp.status === "DeActive" ? "status-DeActive" : "status-Active"
          }`}
        >
          {emp.status || "DeActive"}
        </span>
      </div>
    </td>

    <td>{emp.joinDate || "-"}</td>

    <td className="menu-cell">
      <button
        className="dots-btn"
        onClick={() => handleOpenProfile(emp.id)}
      >
        <FaEllipsisV className="dots-icon" />
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

export default Employee;