    import React, { useState } from 'react';
    import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
    import { doc, setDoc, writeBatch } from 'firebase/firestore';
    import { auth, db } from '../firebase/config';
    import LoginForm from '../components/LoginForm';
    import RegisterForm from '../components/RegisterForm';

    const AuthPage = () => {
      const [isLogin, setIsLogin] = useState(false);
      const [error, setError] = useState('');

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

          
          const mealEvents = [
            "lunch-2025-10-29", "dinner-2025-10-29",
            "lunch-2025-10-30", "dinner-2025-10-30",
            "lunch-2025-10-31", "dinner-2025-10-31",
            "lunch-2025-11-01"
          ];
          
          const batch = writeBatch(db);
          mealEvents.forEach(mealId => {
            const couponRef = doc(db, "users", newUser.uid, "mealCoupons", mealId);
            batch.set(couponRef, { status: "unused" });
          });
          await batch.commit();

        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters long.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        }
      };
      
      const handleLogin = async (email, password) => {
        setError('');
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to log in. Please try again.');
            }
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
    
