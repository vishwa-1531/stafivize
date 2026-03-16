import React, { useState } from "react";
import "../css/Login.css";
import logo from "../image/logo.png";
import { useNavigate, Link } from "react-router-dom";

import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);

      console.log("Login Success");
      navigate("/Dashboard", { replace: true });
    } catch (error) {
      console.log(error.message);
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
            <input
              type="text"
              name="fake_username"
              autoComplete="username"
              style={{ display: "none" }}
            />

            <input
              type="password"
              name="fake_password"
              autoComplete="new-password"
              style={{ display: "none" }}
            />

            <div className="login-row">
              <div className="login-field">
                <label>E-mail Address</label>
               <input
                type="email"
                name="login_email_field"
               autoComplete="off"
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
                  name="login_password_field"
                  autoComplete="new-password"
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
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Choose Role
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
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