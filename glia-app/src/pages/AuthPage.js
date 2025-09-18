import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
// Import the local list of participants from your JSON file
import participants from '../data/participants.json';

const AuthPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');

  const handleLogin = (username, password) => {
    setError('');

    // 1. Check if the password is the correct hardcoded password
    if (password !== 'IAN2025') {
      setError('Incorrect password.');
      return;
    }

    // 2. Find the user in our local JSON file by matching the 'reg_no'
    const foundUser = participants.find(p => p.reg_no.toLowerCase() === username.toLowerCase());

    if (foundUser) {
      // 3. If the user is found and password is correct, call the success function from App.js
      onLoginSuccess(foundUser);
    } else {
      setError('Invalid Attendee ID. Please check the ID and try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <LoginForm 
        onLogin={handleLogin} 
        error={error} 
      />
    </div>
  );
};

export default AuthPage;

