import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const HomePage = () => {
 
  const handleLogout = async () => {
    try {
      await signOut(auth);

    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    
    <div className="card glass-effect" style={{ textAlign: 'center' }}>
      <h1>Welcome to the App!</h1>
      <p>You have successfully logged in.</p>
      <p>Navigate to the schedule or other pages using the header above.</p>
      
     
      <button 
        onClick={handleLogout} 
        className="auth-button" 
        style={{ marginTop: '2rem', maxWidth: '200px', margin: '2rem auto 0' }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default HomePage;
