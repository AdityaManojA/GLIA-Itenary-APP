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
    <header className={`app-header ${className}`}>
      <h1>IAN 2025</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
        
        {/* Show Admin button ONLY to the admin user */}
        {user && user.email === ADMIN_EMAIL && (
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
        )}

        {/* This is the new, correctly styled Sign Out button */}
        {user ? (
          <button onClick={handleLogout}>Sign Out</button>
        ) : (
          <button onClick={() => setCurrentPage('auth')}>Login</button>
        )}
      </nav>
      {user && <p style={{ marginTop: '1rem', opacity: '0.8', fontSize: '0.9rem' }}>Logged in as: {user.email}</p>}
    </header>
  );
};

export default Header;
