import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import participants from '../data/participants.json';
import { getAuth, signInAnonymously } from 'firebase/auth';

const AuthPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const handleLogin = async (username, password) => {
    console.log("--- RUNNING THE LATEST AuthPage.js CODE ---");
    setError('');
    const foundUser = participants.find(p => p.reg_no.toLowerCase() === username.toLowerCase());

    if (!foundUser) {
      setError('Invalid Attendee ID. Please check the ID and try again.');
      return;
    }
    const isAdmin = foundUser.reg_no.toLowerCase() === 'admin2025ian';
    const correctPassword = isAdmin ? 'Admin321' : 'IAN2025';

    if (password === correctPassword) {
      try {
        const auth = getAuth();
        const userCredential = await signInAnonymously(auth);
        const firebaseUid = userCredential.user.uid;


        const completeUser = {
          ...foundUser, 
          uid: firebaseUid 
        };
        onLoginSuccess(completeUser);

      } catch (authError) {
        console.error("Firebase anonymous sign-in failed:", authError);
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