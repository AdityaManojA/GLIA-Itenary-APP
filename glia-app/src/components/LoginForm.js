import React, { useState } from 'react';

const LoginForm = ({ onLogin, error, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="glass-form">
        <h1>Login</h1>
        
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
            placeholder="Enter your password" 
            required 
          />
        </div>
        
        <button type="submit" className="auth-button">Login</button>
        
        {error && <p className="error-text" style={{ color: '#ff9a9a' }}>{error}</p>}
        
        <div className="form-switch-link">
          <p>Don't have an account? <button type="button" onClick={onSwitchToRegister}>Register</button></p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
