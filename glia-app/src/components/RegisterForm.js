import React, { useState } from 'react';

const RegisterForm = ({ onRegister, error, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // New state to handle errors generated within this form
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous form-specific errors
    setFormError('');

    // Check if passwords match and set the new formError if they don't
    if (password !== confirmPassword) {
      setFormError("Passwords do not match!");
      return;
    }
    // This calls the function in AuthPage.js that actually talks to Firebase.
    onRegister(email, password);
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="glass-form">
        <h1>Register</h1>
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Create a password" 
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input 
            id="confirm-password"
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            placeholder="Confirm your password" 
            required 
          />
        </div>
        
        <button type="submit" className="auth-button">Register</button>
        
        {/* This will now display the local form error OR the error from Firebase */}
        {(formError || error) && <p className="error-text">{formError || error}</p>}
        
        <div className="form-switch-link">
          <p>Already have an account? <button type="button" onClick={onSwitchToLogin}>Login</button></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
