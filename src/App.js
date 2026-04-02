import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Dashboard from "./Pages/Dashboard";
import Employee from "./Pages/Employee";
import Attendance from "./Pages/Attendance";
import ProtectedRoute from "./Pages/ProtectedRoute";
import PublicRoute from "./Pages/PublicRoute";
import Resetpassword from "./Pages/Resetpassword";
import Leave from "./Pages/Leave";
import Payroll from "./Pages/Payroll";
import Report from "./Pages/Report";
import Admin from "./Pages/Admin";
import Review from "./Pages/Review";
import EmployeeProfile from "./Pages/EmployeeProfile";
import EmployeeDashboard from "./Pages/EmployeeDashboard";
import AddEmp from "./Pages/AddEmp";
import EmployeeAttendance from "./Pages/EmployeeAttendance";
import EmployeeLeaves from "./Pages/EmployeeLeaves";
import ApplyLeave from "./Pages/ApplyLeave";
import EmployeePayroll from "./Pages/EmployeePayroll";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/Login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/Resetpassword" element={<Resetpassword />} />
      <Route path="/Admin" element={<Admin />} />
      <Route path="/Review" element={<Review />} />
      <Route path ="/AddEmp" element= {<AddEmp/>}></Route>

      {/* Admin routes */}
      <Route
        path="/Dashboard"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Employee"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Employee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Attendance"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Leave"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Leave />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Payroll"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Payroll />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Report"
        element={
          <ProtectedRoute allowedRole="Admin">
            <Report />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-profile/:id"
        element={
          <ProtectedRoute allowedRole="Admin">
            <EmployeeProfile />
          </ProtectedRoute>
        }
      />
      

      
      <Route
        path="/EmployeeDashboard"
        element={
          <ProtectedRoute allowedRole="Employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/EmployeeAttendance" element ={<EmployeeAttendance/>}/>
      <Route path="/EmployeeLeaves" element ={<EmployeeLeaves/>}/>
       <Route path="/ApplyLeave" element ={<ApplyLeave/>}/>
       <Route path ="/EmployeePayroll" element ={<EmployeePayroll/>}/>
      
     
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;