import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

// Define your admin email here as well
const ADMIN_EMAIL = "admin@ian2025.com";

const Header = ({ user, setCurrentPage, className }) => {

  const handleLogout = () => {
    signOut(auth);
    // The listener in App.js will handle page changes
  };

  return (
    // Added position: 'relative' to act as an anchor for the button
    <header className={`app-header ${className}`} style={{ position: 'relative' }}>
      
      {/* The Sign Out button is now positioned absolutely within the header */}
      {user && (
        <button 
          onClick={handleLogout} 
          className="main-nav-button" // Reusing the nav button style for consistency
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            background: 'rgba(218, 241, 222, 0.1)',
            border: '1px solid transparent',
            color: '#DAF1DE',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      )}

      <h1>IAN 2025</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
        
        {/* Logic for showing the Admin button is restored */}
        {user && user.email === ADMIN_EMAIL && (
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
        )}

        {/* The Login button only shows if there is no user */}
        {!user && (
          <button onClick={() => setCurrentPage('auth')}>Login</button>
        )}
      </nav>
      {user && <p style={{ marginTop: '1rem', opacity: '0.8', fontSize: '0.9rem' }}>Logged in as: {user.email}</p>}
    </header>
  );
};

export default Header;
