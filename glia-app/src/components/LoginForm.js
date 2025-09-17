import React, { useState } from 'react';

const LoginForm = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username);
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="glass-form glass-effect">
        <h1>Attendee Login</h1>
        
        <div className="input-group">
          <label htmlFor="username">Attendee ID</label>
          <input 
            id="username"
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Enter your assigned ID" 
            required 
          />
        </div>
        
        <button type="submit" className="auth-button">Login</button>
        
        {error && <p className="error-text">{error}</p>}
        
      </form>
    </div>
  );
};

export default LoginForm;

