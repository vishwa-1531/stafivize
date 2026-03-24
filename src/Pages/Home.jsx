import React from "react";
import "../css/Home.css";
import logo from "../image/logo.png";
import FooterLogo from "../image/FooterLogo.png";
import { useNavigate } from "react-router-dom";
import { FaLinkedin, FaFacebookF, FaInstagram } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      
     
      <nav className="navbar">
        <img src={logo} alt="Logo" className="logo-img" />

        <ul className="nav-links">
          <li>Features</li>
          <li>Solutions</li>
          <li>Pricing</li>
          <li>Resources</li>
          <li>Contact</li>
        </ul>

        <button className="get-btn" onClick={() => navigate("/Login")}>
          Get Started
        </button>
      </nav>

      
      <section className="hero">
        <div className="hero-left">
          <h1>
            Employee Management <br />
            System to Automate <br />
            HR, Attendance & Payroll
          </h1>

          <p>
            Managing employees manually takes time and creates confusion.
            This employee management system helps businesses handle HR
            work in a simple and practical way.
          </p>

          <div className="hero-buttons">
            <button className="get-btn" onClick={() => navigate("/Login")}>
              Get Started
            </button>
            <button className="demo-btn">Try Demo</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="card wide">
            <div className="line blue"></div>
            <div className="line blue"></div>
            <div className="line white"></div>
            <div className="line green"></div>
          </div>

          <div className="card-row">
            <div className="card small">
              <div className="bars">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>

            <div className="card small">
              <div className="circle-chart"></div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="features-section">
        <h1>All-in-One Employee Management System</h1>
        <p>
          Our employee management system keeps all employee work in one place
          and reduces manual HR work.
        </p>

        <div className="features-cards">
          <div className="feature-card">
            Centralized employee database management
          </div>
          <div className="feature-card">
            Automated attendance & leave management
          </div>
          <div className="feature-card">
            Accurate payroll management
          </div>
        </div>
      </section>

      
      <section className="roles-section">
        <h1>Built for HR Teams, Employees & Business <br/>
          Owners</h1>
          <br/>
          <p>This Employee Management Software is designed for organizations of all sizes and roles:</p>

        <div className="roles-part">
          <div className="role-part">
            <h3>HR / Admin</h3>
            <p>Save time by automating <br/>
             attendance, leave, payroll,<br/>
              and reports</p>
          </div>
           <br/>
          <div className="role-part">
            <h3>Employees</h3>
            <p>Easily apply for leave,
             check  <br/> attendance, and download<br/> payslips  </p>
          </div>
            <br/>
          <div className="role-part">
            <h3>Business Owners</h3>
            <p>Reduces HR operational<br/>
               costs and improves payroll<br/>
                accuracy</p>
          </div>
        </div>
      </section>

   
      <footer className="footer">
  <div className="footer-container">
    
    
    <div className="footer-left">
      <img src={FooterLogo} alt="FooterLogo" className="footer-logo" />
      <p className="footer-tagline">
        Manage employees, <br />
        attendance, and payroll easily.
      </p>

      <div className="footer-social">
        <a
    href="https://www.linkedin.com "
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
  >
    <FaLinkedin />
  </a>
  <a
    href="https://www.facebook.com"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Facebook"
  >
    <FaFacebookF />
  </a>
  <a
    href="https://www.instagram.com "
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Instagram"
  >
    <FaInstagram />
  </a>
      </div>
    </div>

   
    <div className="footer-right">
      <div className="footer-column">
        <a href="Blog">Blog</a>
        <a href="Pricing">Pricing</a>
        <a href="Features">Features</a>
      </div>

      <div className="footer-column">
        <a href="contact">Contact</a>
        <a href="Privacy Policy">Privacy Policy</a>
        <a href="Terms & Conditions">Terms & Conditions</a>
      </div>
    </div>

  </div>

  <div className="footer-bottom">
    © 2026 STAFFVIZE. All rights reserved.
  </div>
</footer>
    </div>
  );
};

export default Home;