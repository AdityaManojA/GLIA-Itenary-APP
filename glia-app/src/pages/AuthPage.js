import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import participants from '../data/participants.json';
import { getAuth, signInAnonymously } from 'firebase/auth';

const AuthPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');

  const handleLogin = async (username, password) => {
    setError('');

    let foundUser;
    let correctPassword;

    if (username.toLowerCase() === 'admin2025ian') {
      // UPDATED: Added the admin's email address back in
      foundUser = { 
        reg_no: 'admin2025ian', 
        name: 'admin', 
        email: 'adityamanoja@gmail.com' 
      };
      correctPassword = 'Admin321';
    } else {
      foundUser = participants.find(p => p.reg_no.toLowerCase() === username.toLowerCase());
      correctPassword = 'IAN2025';
    }

    if (!foundUser) {
      setError('Invalid Attendee ID.');
      return;
    }

    if (password === correctPassword) {
      try {
        const auth = getAuth();
        const userCredential = await signInAnonymously(auth);
        const completeUser = { ...foundUser, uid: userCredential.user.uid };
        onLoginSuccess(completeUser);
      } catch (authError) {
        setError("Could not create a secure session. Please try again.");
      }
    } else {
      setError('Incorrect password.');
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