import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import participants from '../data/participants.json';
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';

const AuthPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');

  const handleLogin = async (username, password) => {
    setError('');
    const auth = getAuth();
    const isAdmin = username.toLowerCase() === 'admin2025ian';

    try {
      let userToSet;

      if (isAdmin) {
        // ADMIN PATH: Signs in with email and password to get the permanent Admin UID.
        if (password !== 'Admin321') {
          setError('Incorrect password.');
          return;
        }
        const adminEmail = 'adityamanoja@gmail.com';
        // This signs in the pre-existing admin user.
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
        userToSet = { 
          reg_no: 'admin2025ian', 
          name: 'admin', 
          email: adminEmail, 
          // This UID will now match the one in your security rules.
          uid: userCredential.user.uid 
        };

      } else {
        // REGULAR USER PATH: Finds user in JSON and signs in anonymously.
        const foundUser = participants.find(p => p.reg_no.toLowerCase() === username.toLowerCase());
        if (!foundUser) {
          setError('Invalid Attendee ID.');
          return;
        }
        if (password !== 'IAN2025') {
          setError('Incorrect password.');
          return;
        }
        // Creates a new, temporary session for the attendee.
        const userCredential = await signInAnonymously(auth);
        userToSet = { ...foundUser, uid: userCredential.user.uid };
      }
      
      onLoginSuccess(userToSet);

    } catch (authError) {
      console.error("Firebase sign-in failed:", authError);
      if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/wrong-password' || authError.code === 'auth/user-not-found') {
        setError("Admin authentication failed. Please check the user's credentials in the Firebase Console.");
      } else {
        setError("Could not create a secure session. Please try again.");
      }
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

