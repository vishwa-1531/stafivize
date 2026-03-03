import React, { useState, useEffect } from 'react';
import "../css/Employee.css";
import "../css/Sidebar.css";
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';


import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";   

const Employee = () => {
  const navigate = useNavigate();


  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "employee"),
      (snapshot) => {
        const employeeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmployee(employeeList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching employee:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="employee-layout">
      <Sidebar />

      <div className='employee-content'>
        <div className='employee-topbar'>
          
          <div className='employee-topbar-left'>
            <h2>Employee Activity</h2>
            <p>Real-time presence and directory management.</p>
          </div>

          <div className='employee-topbar-right'>
            <button
              className='employee-btn'
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
              />
            </div>

            <select className="filter-select">
              <option>Department</option>
              <option>HR</option>
              <option>IT</option>
              <option>Finance</option>
            </select>

            <select className="filter-select">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <select className="filter-select">
              <option>Role</option>
              <option>Admin</option>
              <option>Employee</option>
            </select>

            <button className="filter-btn">
              <FaFilter />
            </button>
          </div>
        </div>

        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>DEPARTMENT</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>JOIN DATE</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading employees...</td>
                </tr>
              ) : employee.length === 0 ? (
                <tr>
                  <td colSpan="5">No employees found</td>
                </tr>
              ) : (
                employee.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => navigate(`/Employee/${emp.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.role}</td>
                    <td>{emp.status}</td>
                    <td>{emp.joinDate}</td>
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