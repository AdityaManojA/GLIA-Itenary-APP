import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false); // Start on register page
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // Provide a generic, clean error for login
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (email, password) => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        uid: newUser.uid,
        createdAt: new Date() 
      });

    } catch (err) {
      // This is the updated error handling logic
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page-background">
      <div className="auth-form-container">
        {isLogin ? (
          <LoginForm 
            onLogin={handleLogin} 
            error={error} 
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm 
            onRegister={handleRegister} 
            error={error}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
