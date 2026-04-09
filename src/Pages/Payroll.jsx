import React, { useEffect, useMemo, useState } from "react";
import "../css/Payroll.css";
import "../css/Sidebar.css";
import "../css/Topbar.css";
import Topbar from "../Pages/Topbar";
import Sidebar from "./Sidebar";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
 // updateDoc,
  setDoc,
  doc,
  where // ✅ ADDED
} from "firebase/firestore";
import {
  FaDollarSign,
  FaUserCheck,
  FaClock,
  FaCalendarAlt,
  FaDownload,
  FaPlay,
  FaFilter,
  FaSearch
} from "react-icons/fa";

const Payroll = () => {

  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const companyId = sessionStorage.getItem("companyId"); 
  const currentYear = new Date().getFullYear();
  const [leaves, setLeaves] = useState([]); 

  const months = useMemo(
    () => [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ],
    []
  );

  useEffect(() => {
    const leaveQuery = query(
  collection(db, "leave"),
  where("companyId", "==", companyId)
);

const unsubLeaves = onSnapshot(leaveQuery, (snapshot) => {
  const leaveData = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }));
  setLeaves(leaveData);
});
    if (!companyId) return; // ✅ ADDED

    const payrollQuery = query(
      collection(db, "payroll"),
      where("companyId", "==", companyId), // ✅ ADDED
      orderBy("createdAt", "desc")
    );

    const employeeQuery = query(
      collection(db, "employee"),
      where("companyId", "==", companyId) 
    );

    const unsubPayroll = onSnapshot(payrollQuery, (snapshot) => {
      const arr = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setPayrollData(arr);
    });

    const unsubEmployees = onSnapshot(employeeQuery, (snapshot) => {
      const employeeData = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));
      setEmployees(employeeData);
    });

    return () => {
      unsubPayroll();
      unsubEmployees();
      unsubLeaves();
    };
  }, [companyId]);

  const normalizeDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
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

  const getEmployeeName = (item, employee) => {
    if (item.employeeName) return item.employeeName;
    if (!employee) return "Unknown Employee";
    if (employee.fullName) return employee.fullName;

    const fullName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
    return fullName || employee.name || "Unknown Employee";
  };

  const getInitials = (name) => {
    if (!name) return "NA";
    const words = String(name).trim().split(" ").filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }; 
  const getLWPDays = (employeeId, selectedMonth) => {
  return leaves
    .filter((l) => {
      const leaveMonth = new Date(l.fromDate).getMonth();

      return (
        String(l.employeeId) === String(employeeId) &&
        (l.leaveType || "").toLowerCase() === "leave with pay" &&
        (l.status || "").toLowerCase() === "approved" &&
        leaveMonth === selectedMonth
      );
    })
    .reduce((total, l) => total + (l.days || 0), 0);
};

  const mergedPayroll = useMemo(() => {
    return payrollData.map((item) => {
      const payrollEmployeeId = String(item.employeeId || "")
        .trim()
        .toUpperCase();

      const employee =
        employees.find(
          (emp) => String(emp.id || "").trim().toUpperCase() === payrollEmployeeId
        ) ||
        employees.find(
          (emp) =>
            String(emp.employeeId || "").trim().toUpperCase() === payrollEmployeeId
        );

      return {
        ...item,
        employeeName: getEmployeeName(item, employee),
        role: item.role || employee?.role || employee?.jobTitle || "-",
        avatar: item.avatar || employee?.profileImage || employee?.photoURL || "",
        department: item.department || employee?.department || "-",
        email: item.email || employee?.email || "-",
        baseSalary: Number(item.baseSalary || employee?.basicSalary || 0),
        bonus: Number(item.bonus || 0),
        deduction: Number(item.deduction || 0),
        status: item.status || "Pending"
      };
    });
  }, [payrollData, employees]);

  const filtered = useMemo(() => {
    const selectedMonthName = months[selectedMonth].toLowerCase();

    return mergedPayroll.filter((emp) => {
      const searchText = search.toLowerCase();

      const nameMatch = String(emp.employeeName || "")
        .toLowerCase()
        .includes(searchText);

      const emailMatch = String(emp.email || "")
        .toLowerCase()
        .includes(searchText);

      const roleMatch = String(emp.role || "")
        .toLowerCase()
        .includes(searchText);

      let monthMatch = true;

      if (emp.month) {
        monthMatch = String(emp.month || "")
          .toLowerCase()
          .includes(selectedMonthName);
      } else if (emp.createdAt) {
        const d = normalizeDate(emp.createdAt);
        monthMatch = d ? d.getMonth() === selectedMonth : true;
      }

      return (nameMatch || emailMatch || roleMatch || searchText === "") && monthMatch;
    });
  }, [mergedPayroll, search, selectedMonth, months]);

 const totalPayroll = filtered.reduce((sum, emp) => {
  const lwpDays = getLWPDays(emp.employeeId, selectedMonth);
  const perDaySalary = Number(emp.baseSalary || 0) / 30;
  const lwpDeduction = perDaySalary * lwpDays;

  const net =
    Number(emp.baseSalary || 0) +
    Number(emp.bonus || 0) -
    Number(emp.deduction || 0) -
    lwpDeduction;

  return sum + net;
}, 0);

  const employeesPaid = filtered.filter(
    (emp) => String(emp.status).toLowerCase() === "processed"
  ).length;

  const pending = filtered.filter(
    (emp) => String(emp.status).toLowerCase() === "pending"
  ).length;

  const exportPayroll = () => {
    const headers = [
      "Employee Name","Department","Role",
      "Base Salary","Bonus","Deduction","Net Pay","Status"
    ];

    const rows = filtered.map((emp) => {
    const lwpDays = getLWPDays(emp.employeeId, selectedMonth);

const perDaySalary = Number(emp.baseSalary || 0) / 30;

const lwpDeduction = perDaySalary * lwpDays;

const net =
  Number(emp.baseSalary || 0) +
  Number(emp.bonus || 0) -
  Number(emp.deduction || 0) -
  lwpDeduction;
      return [
        emp.employeeName || "-",
        emp.department || "-",
        emp.role || "-",
        emp.baseSalary || 0,
        emp.bonus || 0,
        emp.deduction || 0,
        net,
        emp.status || "Pending"
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payroll.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runPayroll = async () => {
  try {
    const companyId = sessionStorage.getItem("companyId");

    for (const emp of employees) {
      // 🔹 unique payroll id (month-wise)
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const payrollId = `${emp.employeeId}-${month}-${year}`;

      await setDoc(doc(db, "payroll", payrollId), {
        employeeId: emp.employeeId,
      employeeName:
  emp.name ||
  `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
  "Unknown",
        baseSalary:
  Number(emp.basicSalary) ||
  Number(emp.salary) ||
  0,
     bonus: 0,
        deduction: 0,
        status: "Processed",
        companyId: companyId,
        createdAt: new Date(),
        paidAt: new Date(),
        month: month,
        year: year
      });
    }

    alert("Payroll generated successfully!");
  } catch (error) {
    console.error(error);
  }
};
  const today = new Date();

  let year = today.getFullYear();
  if (selectedMonth < today.getMonth()) {
    year += 1;
  }

  const nextPayDate = new Date(year, selectedMonth + 1, 0);

  const daysRemaining = Math.ceil(
    (nextPayDate - today) / (1000 * 60 * 60 * 24)
  );

  const formattedDate = nextPayDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="payroll-container">
        <Topbar
          mainTitle="PAYROLL"
          section="OVERVIEW"
          notifications={[
            { id: "1", text: `${payrollData.length} payroll records available` }
          ]}
          helpItems={[
            "View monthly payroll records.",
            "Check salary, bonus, and deductions.",
            "Export payroll details when needed."
          ]}
        />

       
        <div className="payroll-header">
          <div>
            <h1>Payroll Management</h1>
            <p>Overview of your organization's financial cycles</p>
          </div>

          <div className="payroll-actions">
            <div className="month-select">
              <FaCalendarAlt />
              <select
                className="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month} {currentYear}
                  </option>
                ))}
              </select>
            </div>

            <button className="action-btn" onClick={exportPayroll}>
              <FaDownload /> Export
            </button>

            <button className="run-btn" onClick={runPayroll}>
              <FaPlay /> Run Payroll
            </button>
          </div>
        </div>

        <div className="payroll-cards">
          <div className="card">
            <div className="card-top">
              <p>Total Monthly Payroll</p>
              <div className="card-icon blue">
                <FaDollarSign />
              </div>
            </div>
            <h2>₹{totalPayroll.toLocaleString()}</h2>
            <span>vs last month</span>
          </div>

          <div className="card">
            <div className="card-top">
              <p>Employees Paid</p>
              <div className="card-icon green">
                <FaUserCheck />
              </div>
            </div>

            <h2>
              {employeesPaid} / {filtered.length}
            </h2>

            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width:
                    filtered.length > 0
                      ? `${(employeesPaid / filtered.length) * 100}%`
                      : "0%"
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-top">
              <p>Pending Approvals</p>
              <div className="card-icon yellow">
                <FaClock />
              </div>
            </div>

            <h2>{pending}</h2>
            <span>Awaiting final reviews</span>
          </div>

          <div className="card">
            <div className="card-top">
              <p>Next Pay Date</p>
              <div className="card-icon blue">
                <FaCalendarAlt />
              </div>
            </div>

            <h2>{formattedDate}</h2>
            <span>
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : "Payroll completed"}
            </span>
          </div>
        </div>

        <div className="records-container">
         
          <div className="records-header">
            <h3>Payroll Records</h3>

            <div className="records-actions">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button className="filter-btn">
                <FaFilter />
              </button>
            </div>
          </div>

          <table className="payroll-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Paid On</th>
                <th>Base Salary</th>
                <th>Bonuses</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
              </tr>
            </thead>

           <tbody>
  {filtered.length > 0 ? (
    filtered.map((emp) => {
    const lwpDays = getLWPDays(emp.employeeId, selectedMonth);

const perDaySalary = Number(emp.baseSalary || 0) / 30;

const lwpDeduction = perDaySalary * lwpDays;

const net =
  Number(emp.baseSalary || 0) +
  Number(emp.bonus || 0) -
  Number(emp.deduction || 0) -
  lwpDeduction;

      return (
        <tr key={emp.id}>
          <td className="employee-cell">
            {emp.avatar ? (
              <img src={emp.avatar} alt={emp.employeeName} />
            ) : (
              <div className="payroll-avatar-fallback">
                {getInitials(emp.employeeName)}
              </div>
            )}

            <div>
              <p>{emp.employeeName}</p>
              <span>{emp.role}</span>
            </div>
          </td>

          <td>
            {formatDate(
              emp.paidAt ||
              emp.salaryDate ||
              emp.paymentDate ||
              emp.createdAt
            )}
          </td>

          <td>₹{Number(emp.baseSalary || 0).toLocaleString()}</td>

          <td className="bonus">
            ₹{Number(emp.bonus || 0).toLocaleString()}
          </td>

          <td className="deduction">
            ₹{Number(emp.deduction || 0).toLocaleString()}
          </td>

          <td>₹{net.toLocaleString()}</td>

          <td>
            <span className={`status ${String(emp.status).toLowerCase()}`}>
              {emp.status}
            </span>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
        No payroll records found
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;