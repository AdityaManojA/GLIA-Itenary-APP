import React from 'react';
import { getAuth } from 'firebase/auth'; // Import getAuth

const Header = ({ user, onLogout, setCurrentPage }) => {
  const isAdmin = user && user.email === 'adityamanoja@gmail.com';

  // TEMPORARY DEBUG FUNCTION to see the live user's details
  const checkCurrentUser = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log("--- LIVE SITE AUTH CHECK ---");
      console.log("User UID:", currentUser.uid);
      console.log("User Email:", currentUser.email);
      console.log("Is Anonymous:", currentUser.isAnonymous);
      console.log("Full User Object:", currentUser);
    } else {
      console.log("--- LIVE SITE AUTH CHECK ---");
      console.log("No Firebase user is currently signed in.");
    }
  };

  return (
    <header className="app-header">
      
      <div className="header-logos-container">
        <img src="/lh1.png" alt="Logo 1" className="header-logo-small" />
        <img src="/lh2.png" alt="Logo 2" className="header-logo-small" />
        <img src="/lh3.png" alt="Logo 3" className="header-logo-small" />
      </div>
      
      {user && (
        <div className="header-user-info">
          {/* TEMPORARY DEBUG BUTTON */}
          <button onClick={checkCurrentUser} style={{backgroundColor: 'yellow', color: 'black', marginRight: '10px', border: '1px solid black'}}>
            Check Auth
          </button>
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
