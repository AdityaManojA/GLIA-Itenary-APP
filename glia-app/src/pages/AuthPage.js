import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (email, password) => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
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
  );
};

export default AuthPage;
