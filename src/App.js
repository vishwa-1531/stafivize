import './App.css';
import  {Route,Routes,Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import Dashboard from './Pages/Dashboard';
import Employee from './Pages/Employee';
import Attendance from './Pages/Attendance';
import ProtectedRoute from './Pages/ProtectedRoute';
import PublicRoute from './Pages/PublicRoute';
import Resetpassword from './Pages/Resetpassword';
import Leave from './Pages/Leave';
import Payroll from './Pages/Payroll';
import Report from './Pages/Report';
import Admin from './Pages/Admin';
import Review from './Pages/Review';
import EmployeeProfile from './Pages/EmployeeProfile';

function App() {
  return (
 
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/Login" element={<PublicRoute><Login /></PublicRoute>}/>
  <Route path="/SignUp" element={<SignUp/>}/>
  <Route path='/Dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
  <Route path='/Employee' element={<ProtectedRoute><Employee/></ProtectedRoute>}/>
  <Route path='/Attendance' element={<ProtectedRoute><Attendance/></ProtectedRoute>}/>
  <Route path='/Resetpassword' element={<Resetpassword/>}/>
  <Route path='/Leave' element={<ProtectedRoute><Leave/></ProtectedRoute>}/>
  <Route path='/Payroll' element={<ProtectedRoute><Payroll/></ProtectedRoute>}/>
  <Route path='/Report' element={<ProtectedRoute><Report/></ProtectedRoute>}/>
  <Route path='/Admin' element={<Admin/>}/>
  <Route path='/Review' element={<Review/>}/>
  <Route
  path="/employee-profile/:id"
  element={
    <ProtectedRoute>
      <EmployeeProfile />
    </ProtectedRoute>
  }
/>
 <Route path="*" element={<Navigate to="/" replace />} />
</Routes> 


 );
 
 }

export default App;