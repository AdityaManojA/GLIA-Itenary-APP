import React, { useState } from 'react';

const RegisterForm = ({ onRegister, error, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {

      alert("Passwords do not match!");
      return;
    }
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
        
        {error && <p className="error-text" style={{ color: '#ff9a9a' }}>{error}</p>}
        
        <div className="form-switch-link">
          <p>Already have an account? <button type="button" onClick={onSwitchToLogin}>Login</button></p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
