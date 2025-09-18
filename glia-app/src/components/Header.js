import React from 'react';

// Define your list of admin emails here
const ADMIN_EMAILS = ["adityamanoja@gmail.com"]; 

const Header = ({ user, onLogout, setCurrentPage }) => {
  return (
    <header className="app-header">
      
      {user && (
        <div className="header-user-info">
          <button onClick={onLogout} className="main-nav-button">
            Sign Out
          </button>
          <p>
            <span>Logged in as: </span>{user.name}
          </p>
        </div>
      )}

      <h1>IAN 2025</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
        
        {/* Only show Admin button to admin users */}
        {user && ADMIN_EMAILS.includes(user.email) && (
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
        )}
      </nav>
    </header>
  );
};

export default Header;

