import React from "react";
import "../css/Dashboard.css";
import "../css/Sidebar.css";
import Sidebar from "./Sidebar";
 
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaShieldAlt,
  

} from "react-icons/fa";

const Dashboard = () => {
  
  return (
    
    <div className="dashboard-layout">
     <Sidebar/>
     
    
     <div className="dashboard-content">
     

      {/* Top Section */}



     <div className="topbar">
     <div className="topbar-left">
      <h2>Dashboard Overview</h2>
      <p>Welcome back, Dhrupal. Here's what's happening today.</p>
     </div>

     
     </div> 
      {/* Cards */}
      <div className="cards">

     <div className="card active-card">
     <span className="card-badge blue-badge">+12%</span>
     

     <div className="icon-box blue-bg">
      <FaUsers className="card-icon" />
     </div>

     <h4>Total Employee</h4>
    <h2>1,248</h2>
  </div>


  <div className="card">
    <span className="card-badge green-badge">82% rate</span>

    <div className="icon-box green-bg">
      <FaUserCheck className="card-icon" />
    </div>

    <h4>Present Today</h4>
    <h2>942</h2>
  </div>


  <div className="card">
    <span className="card-badge yellow-badge">4 urgent</span>

    <div className="icon-box yellow-bg">
      <FaUserTimes className="card-icon" />
    </div>

    <h4>On Leave</h4>
    <h2>24</h2>
  </div>


  <div className="card">
    <span className="card-badge blue-badge">June 2024</span>

    <div className="icon-box blue-bg">
      <FaShieldAlt className="card-icon" />
    </div>

    <h4>Payroll Status</h4>
    <h2>Processed</h2>
  </div>

</div>


      {/* Bottom Section */}
      <div className="bottom-section">

        {/* Attendance */}
        <div className="attendance">
          <div className="section-header">
            <h3>Attendance Trends</h3>
           <select className="dropdown">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
  </select>
          </div>

          <div className="bars">
            <div className="bar mon"></div>
            <div className="bar tue"></div>
            <div className="bar wed"></div>
            <div className="bar thu"></div>
            <div className="bar fri"></div>
            <div className="bar sat"></div>
            <div className="bar sun"></div>
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

            <div className="donut"></div>

            <div className="legend">
             <div><span className="dot blue"></span> Engineering 45%</div>
             <div><span className="dot green"></span> Sales 25%</div>
             <div><span className="dot yellow"></span> Marketing 20%</div>
             <div><span className="dot gray"></span> Other 10%</div>
             </div>
          </div>
        </div>
       </div>
    </div>
  );
};

export default Dashboard;
