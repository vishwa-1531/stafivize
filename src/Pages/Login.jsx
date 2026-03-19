import React, { useState } from "react";
import "../css/Login.css";
import logo from "../image/logo.png";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  getDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      sessionStorage.removeItem("selectedRole");

      // 1. Check user role in Firestore BEFORE login
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("User record not found");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      if (!userData.role) {
        alert("Role not found for this user");
        return;
      }

      if (userData.role !== role) {
        alert(`This account is registered as ${userData.role}, not ${role}`);
        return;
      }

      // 2. Only if role is correct, then sign in
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 3. Optional double-check by uid doc
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("User record not found");
        return;
      }

      sessionStorage.setItem("selectedRole", role);

      if (role === "Admin") {
        navigate("/Dashboard", { replace: true });
      } else if (role === "Employee") {
        navigate("/EmployeeDashboard", { replace: true });
      }
    } catch (error) {
      alert(error.message);
    }
  };

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
                <input type="checkbox" />
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