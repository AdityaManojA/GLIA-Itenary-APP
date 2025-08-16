import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

// Define your list of admin emails
const ADMIN_EMAILS = ["adityamanoja@gmail.com"];

const Header = ({ user, setCurrentPage, className }) => {

  const handleLogout = () => {
    signOut(auth);
    // The listener in App.js will handle page changes
  };

  return (
    // Added position: 'relative' to act as an anchor for the button
    <header className={`app-header ${className}`} style={{ position: 'relative' }}>
      
      {/* This new div groups the button and the user email together */}
      {user && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem',
            textAlign: 'right' // Aligns the text to the right
          }}
        >
          <button 
            onClick={handleLogout} 
            className="main-nav-button" // Reusing the nav button style for consistency
            style={{ 
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
          {/* The user email is now here, styled to be smaller */}
          <p style={{ margin: '0.5rem 0 0', opacity: '0.8', fontSize: '0.8rem' }}>
            {/* CORRECTED: Changed the inner <p> to a <span> */}
            <span>User : </span>{user.email}
          </p>
        </div>
      )}

      <h1>IAN 2025</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
        
        {/* CORRECTED: Check if the user's email is in the ADMIN_EMAILS array */}
        {user && ADMIN_EMAILS.includes(user.email) && (
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
        )}

        {/* The Login button only shows if there is no user */}
        {!user && (
          <button onClick={() => setCurrentPage('auth')}>Login</button>
        )}
      </nav>
      {/* The old "Logged in as" text has been removed from here */}
    </header>
  );
};

export default Header;
