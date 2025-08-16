import React, { useState } from 'react';

const RegisterForm = ({ onRegister, error, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // State to handle the "passwords do not match" error locally
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Always clear the local password eraror on a new submission
    setPasswordError('');

    // Check if passwords match. If not, set the local error and stop.
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return; 
    }
    
    // If passwords match, proceed with the registration function from the parent
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
        
        {/* This is the stable way to display errors without causing a loop */}
        {passwordError && <p className="error-text" style={{ color: '#ff9a9a' }}>{passwordError}</p>}
        {error && <p className="error-text" style={{ color: '#ff9a9a' }}>{error}</p>}
        
        <div className="form-switch-link">
          <p>Already have an account? <button type="button" onClick={onSwitchToLogin}>Login</button></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
