import React from 'react';

const Header = ({ user, onLogout, setCurrentPage }) => {
  const isAdmin = user && user.email === 'adityamanoja@gmail.com';

  return (
    <header className="app-header">
      
  
      <div className="header-logos-container">
        <img src="/lh1.png" alt="Logo 1" className="header-logo-small" />
        <img src="/lh2.png" alt="Logo 2" className="header-logo-small" />
        <img src="/lh3.png" alt="Logo 3" className="header-logo-small" />
      </div>
      
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

      <nav className="main-nav">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
        <button onClick={() => setCurrentPage('itinerary')}>My Itinerary</button>
        <button onClick={() => setCurrentPage('alerts')}>Alerts</button>
        
        {isAdmin && (
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
        )}
      </nav>
    </header>
  );
};

export default Header;