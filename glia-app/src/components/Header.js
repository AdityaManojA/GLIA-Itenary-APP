// src/components/Header.js

import React, { useState } from 'react';

const Header = ({ user, onLogout, currentPage, setCurrentPage }) => {
 // Changed from boolean to store the name of the page currently animating
 const [animatingPage, setAnimatingPage] = useState(null);

 const isAdmin = user && user.role === 'admin';
 const isScanner = user && user.role === 'scanner';

  const handleTabClick = (pageName) => {
    if (pageName === currentPage || animatingPage) return;
    
    // 1. Start animation on the clicked page
    setAnimatingPage(pageName);

    // 2. Wait for animation (0.7s), then change the page state
    setTimeout(() => {
      setCurrentPage(pageName);
      
      // 3. Stop animation immediately after state change
      setAnimatingPage(null); 

    }, 700); // Must match the CSS animation duration (0.7s)
  };
  
  // Helper function array for buttons
  const navPages = ['home', 'schedule', 'map', 'alerts'];
  if (isAdmin) navPages.push('admin');
  if (isAdmin || isScanner) navPages.push('scanner');


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
        {navPages.map(page => {
          const isCurrent = currentPage === page;
          const isAnimating = animatingPage === page;
          
          return (
            <button 
              key={page}
              onClick={() => handleTabClick(page)}
              className={`${isCurrent ? 'active' : ''} ${isAnimating ? 'is-animating' : ''}`}
              // Disable if ANY button is animating
              disabled={!!animatingPage} 
            >
              <span>{page.charAt(0).toUpperCase() + page.slice(1)}</span>
            </button>
          );
        })}
        
   </nav>
  </header>
 );
};

export default Header;