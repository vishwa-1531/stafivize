import React, { useEffect,useState } from "react";
import "../css/Login.css";
import logo from "../image/logo.png";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
 
  getDocs,
  collection,
  query,    
  where
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const [companyId, setCompanyId] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
 const[ rememberMe, setRememberMe] = useState("false");

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    
   const q = query(
  collection(db, "users"),
  where("uid", "==", user.uid)
);

const querySnapshot = await getDocs(q);

if (querySnapshot.empty) {
  alert("User record not found");
  return;
}

const userData = querySnapshot.docs[0].data();
   if (userData.role !== role) {
  alert(`This account is registered as ${userData.role}`);

  
  await signOut(auth);
  sessionStorage.clear();


  
  return;
}    

    
    if (userData.companyId.trim() !== companyId.trim()) {
      console.log("DB:", userData.companyId);
      console.log("Input:", companyId);
      alert("Invalid Company ID");
       await signOut(auth);
       

      return;
    }

    
    sessionStorage.setItem("companyId", companyId);
    sessionStorage.setItem("selectedRole", role);
    
if (rememberMe) {
  localStorage.setItem(
    "adminLogin",
    JSON.stringify({
      email,
      password,
      companyId
    })
  );
} else {
  localStorage.removeItem("adminLogin");
}

    
    if (role === "Admin") {
      navigate("/Dashboard", { replace: true });
    } else {
      navigate("/EmployeeDashboard", { replace: true });
    }

  } catch (error) {
    alert(error.message);
  }
};
  useEffect(() => {
   const savedLogin = JSON.parse(localStorage.getItem("adminLogin"));

  if (savedLogin) {
    setEmail(savedLogin.email || "");
    setPassword(savedLogin.password || "");
    setCompanyId(savedLogin.companyId || "");
     setRememberMe(true); 
  }
}, []);

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>
          Manage <br /> Your <br /> Workforce <br /> in One <br /> System
        </h1>
        <p>
          Log in to access attendance, payroll, and employee records.
        </p>
      </div>

      <div className="login-right">
        <div className="loginlogo-box">
          <img src={logo} alt="logo" className="loginlogo-img" />
        </div>

        <div className="login-card">
          <h3>Login To Your Account</h3>

          <form className="login-form" onSubmit={handleLogin} autoComplete="off">

            
            <div className="login-row">
              <div className="login-field">
                <label>Company ID</label>
                <input
                  type="text"
                  required
                  value={companyId}
                  placeholder="company Id"
                  onChange={(e) => setCompanyId(e.target.value)}
                />
              </div>
            </div>

            
            <div className="login-row">
              <div className="login-field">
                <label>E-mail Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            
            <div className="login-row">
              <div className="login-field">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="login-row">
              <div className="login-field">
                <label className="login-label">Role</label>
                <select
                  className="login-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="login-options">
              <label className="remember">
                <input
  type="checkbox"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
/>
                <span>Remember me</span>
              </label>

              <Link to="/Resetpassword" className="reset-password">
                Reset password?
              </Link>
            </div>

            <button type="submit" className="login-btn">
              Sign in
            </button>

            <p className="login-text">
              Don't have an account yet?
              <Link to="/SignUp"> Join Stafivize today</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;