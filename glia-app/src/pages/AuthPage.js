// TEMPORARY CODE TO FIND YOUR UID
import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import { getAuth, signInAnonymously } from 'firebase/auth';

const AuthPage = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const handleLogin = async (username, password) => {
    if (username.toLowerCase() === 'admin2025ian' && password === 'Admin321') {
      try {
        const auth = getAuth();
        const userCredential = await signInAnonymously(auth);
        const firebaseUid = userCredential.user.uid;
        alert(`Your Admin UID is: ${firebaseUid}\n\nCOPY THIS VALUE!`); // This will show your ID
        const adminUser = { reg_no: 'admin2025ian', name: 'admin', uid: firebaseUid };
        onLoginSuccess(adminUser);
      } catch (e) { setError('Could not sign in.'); }
    } else {
      setError('Invalid credentials for this test.');
    }
  };

  return (
    <div className="auth-form-container">
      <LoginForm onLogin={handleLogin} error={error} />
    </div>
  );
};
export default AuthPage;