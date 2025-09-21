// src/pages/AuthPage.js

import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import participants from '../data/participants.json';
import { getAuth, signInAnonymously } from 'firebase/auth'; // Import Firebase Anonymous Auth

const AuthPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');

  // Make the function async to wait for Firebase
  const handleLogin = async (username, password) => {
    console.log("--- RUNNING THE LATEST AuthPage.js CODE ---");
    setError('');

    // 1. Find the user in our local JSON file
    const foundUser = participants.find(p => p.reg_no.toLowerCase() === username.toLowerCase());

    if (!foundUser) {
      setError('Invalid Attendee ID. Please check the ID and try again.');
      return;
    }

    // 2. Check for the correct password
    const isAdmin = foundUser.reg_no.toLowerCase() === 'admin2025ian';
    const correctPassword = isAdmin ? 'Admin321' : 'IAN2025';

    if (password === correctPassword) {
      try {
        // 3. Sign the user in anonymously to get a real Firebase UID
        const auth = getAuth();
        const userCredential = await signInAnonymously(auth);
        const firebaseUid = userCredential.user.uid;

        // 4. Combine the user data from JSON with the real UID from Firebase
        const completeUser = {
          ...foundUser, // This includes name, reg_no, email (if it exists)
          uid: firebaseUid // This adds the real, secure UID
        };

        // 5. If successful, call the success function from App.js
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