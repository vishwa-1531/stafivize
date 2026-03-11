import React, { useEffect, useState } from "react";
import "../css/Payroll.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
import { db } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { FaDollarSign, FaUserCheck, FaClock, FaCalendarAlt,FaDownload ,FaPlay,FaFilter,FaSearch} from "react-icons/fa";
const Payroll = () => {

  const [payrollData, setPayrollData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
 const currentYear = new Date().getFullYear();

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
  useEffect(() => {

    const q = query(collection(db, "payroll"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {

      const arr = [];

      snapshot.forEach((doc) => {
        arr.push({ id: doc.id, ...doc.data() });
      });

      setPayrollData(arr);
    });

    return () => unsub();

  }, []);

  const filtered = payrollData.filter((emp) =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = payrollData.reduce(
    (sum, emp) => sum + (emp.baseSalary + emp.bonus - emp.deduction),
    0
  );

  const employeesPaid = payrollData.filter(
    (emp) => emp.status === "Processed"
  ).length;

  const pending = payrollData.filter(
    (emp) => emp.status === "Pending"
  ).length;
  const exportPayroll = () => {

  const headers = [
    "Employee Name",
    "Role",
    "Base Salary",
    "Bonus",
    "Deduction",
    "Net Pay",
    "Status"
  ];

  const rows = payrollData.map(emp => {

    const net = (emp.baseSalary || 0) + (emp.bonus || 0) - (emp.deduction || 0);

    return [
      emp.employeeName,
      emp.role,
      emp.baseSalary,
      emp.bonus,
      emp.deduction,
      net,
      emp.status
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

};
const runPayroll = async () => {

  try {

    const updates = payrollData.map(async (emp) => {

      if (emp.status !== "Processed") {

        const ref = doc(db, "payroll", emp.id);

        await updateDoc(ref, {
          status: "Processed"
        });

      }

    });

    await Promise.all(updates);

    alert("Payroll processed successfully");

  } catch (error) {
    console.error(error);
  }

};
const today = new Date();

let year = today.getFullYear();

// if selected month already passed this year
if (selectedMonth < today.getMonth()) {
  year = year + 1;
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
      <Sidebar/>
    <div className="payroll-container">
  
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


      {/* Cards */}

      <div className="payroll-cards">

       <div className="card">

  <div className="card-top">
    <p>Total Monthly Payroll</p>
    <div className="card-icon blue">
      <FaDollarSign/>
    </div>
  </div>

  <h2>₹{totalPayroll.toLocaleString()}</h2>
  <span>vs last month</span>

</div>

      <div className="card">

  <div className="card-top">
    <p>Employees Paid</p>
    <div className="card-icon green">
      <FaUserCheck/>
    </div>
  </div>

  <h2>{employeesPaid} / {payrollData.length}</h2>

  <div className="progress">
    <div
      className="progress-bar"
      style={{width:`${(employeesPaid/payrollData.length)*100}%`}}
    ></div>
  </div>

</div>

       <div className="card">

  <div className="card-top">
    <p>Pending Approvals</p>
    <div className="card-icon yellow">
      <FaClock/>
    </div>
  </div>

  <h2>{pending}</h2>
  <span>Awaiting final reviews</span>

</div>

    <div className="card">

       <div className="card-top">
       <p>Next Pay Date</p>
        <div className="card-icon blue">
          <FaCalendarAlt/>
        </div>
       </div>

     <h2>{formattedDate}</h2>
<span>
  {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Payroll completed"}
</span>

    </div>
      </div>
      <div className="records-container">

        <div className="records-header">

          <h3>Payroll Records</h3>

          <div className="records-actions">

           <div className="search-box">

          <FaSearch className="search-icon"/>

         <input
          type="text"
          placeholder="Search by name or email..."
         onChange={(e) => setSearch(e.target.value)}
         />

       </div>
          <button className="filter-btn">
          <FaFilter />
             </button>
          </div>

        </div>


        {/* Table */}

        <table className="payroll-table">

          <thead>
            <tr>
              <th>Employee</th>
              <th>Base Salary</th>
              <th>Bonuses</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map((emp) => {

              const net = emp.baseSalary + emp.bonus - emp.deduction;

              return (
                <tr key={emp.id}>

                  <td className="employee-cell">
                    <img src={emp.avatar} alt="" />
                    <div>
                      <p>{emp.employeeName}</p>
                      <span>{emp.role}</span>
                    </div>
                  </td>

                  <td>₹{emp.baseSalary.toLocaleString()}</td>

                  <td className="bonus">
                    ₹{emp.bonus.toLocaleString()}
                  </td>

                  <td className="deduction">
                    ₹{emp.deduction.toLocaleString()}
                  </td>

                  <td>₹{net.toLocaleString()}</td>

                  <td>
                    <span className={`status ${emp.status.toLowerCase()}`}>
                      {emp.status}
                    </span>
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>
     </div>
    </div>
  );
};

export default Payroll;