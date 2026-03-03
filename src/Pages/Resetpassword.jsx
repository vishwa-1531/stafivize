import React from 'react';
import logo from "../image/logo.png";
import { Link } from 'react-router-dom';
import "../css/Resetpassword.css";




function Resetpassword() {
  
    
  return (
    <div className='resetpassword-container'>
        <div className='resetpasswordlogo-box'>
          <img src={logo} alt='logo' className='resetpasswordlogo-img'/>
          <div className='resetpassword-card'>
        
            <h1>Forget your password ?</h1>
            <p>Enter your e-mail address below and we’ll <br/>send you instructions to reset your password.</p>
            <form className='resetpassword-form'>
                <div className='resetpassword-row'>
                    <div className='resetpassword-field'>
                        <label >E-mail Address</label>
                        <input type='email' required/>
                        <button type='submit' className='resetpassword'>Reset Password</button>
                        <p className='resetpassword-text'>Remembered your password?

                            <Link to="/Login">Sign In</Link>
                        </p>
                    </div>
                </div>

            </form>
            </div>
        </div>
    </div>
  )
}

export default Resetpassword;