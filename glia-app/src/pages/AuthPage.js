import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import LoginForm from '../components/LoginForm';

const AuthPage = () => {
  const [error, setError] = useState('');

  const handleLogin = async (username, password) => {
    setError('');

    // Step 1: Check if the provided password is the correct hardcoded password.
    if (password !== 'IAN2025') {
      setError('Incorrect password.');
      return;
    }

    try {
      // Step 2: Check if a participant with the provided username (reg_no) exists.
      const participantsRef = collection(db, 'participants');
      const q = query(participantsRef, where("reg_no", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid Attendee ID. Please check the ID and try again.');
        return;
      }

      // Step 3: If both checks pass, construct the hidden email and sign in.
      // IMPORTANT: You must have already created these users in the Firebase Auth console.
      const hiddenEmail = `${username.replace(/\//g, '_')}@ian2025.app`; // Sanitize username for email
      
      await signInWithEmailAndPassword(auth, hiddenEmail, password);
      // A successful login will be detected by the listener in App.js.

    } catch (err) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
         setError('Login failed. Please ensure this Attendee ID has been set up by an admin.');
      } else {
        setError('An error occurred during login. Please contact support.');
      }
    }
  };

  return (
    <div className="auth-form-container">
      {/* This page now only shows the LoginForm */}
      <LoginForm 
        onLogin={handleLogin} 
        error={error} 
      />
    </div>
  );
};

export default AuthPage;

