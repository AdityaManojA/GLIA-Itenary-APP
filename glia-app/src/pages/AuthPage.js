import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import LoginForm from '../components/LoginForm';

const AuthPage = () => {
  const [error, setError] = useState('');

  const handleLogin = async (username) => {
    setError('');

    try {
      // Step 1: Check if a participant with the provided username exists in Firestore.
      const participantsRef = collection(db, 'participants');
      const q = query(participantsRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid Attendee ID. Please check the ID and try again.');
        return;
      }

      // Step 2: If the username is valid, construct the hidden email and standard password.
      const hiddenEmail = `${username}@ian2025.app`;
      const standardPassword = 'IAN2025';

      // Step 3: Attempt to sign in the user with the constructed credentials.
      await signInWithEmailAndPassword(auth, hiddenEmail, standardPassword);
      // A successful login will be caught by the onAuthStateChanged listener in your App.js,
      // which will then show the main application content.

    } catch (err) {
      console.error("Login Error:", err);
      // Provide a generic error for security, but check the console for specific Firebase errors.
      setError('An error occurred during login. Please contact an admin for help.');
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

