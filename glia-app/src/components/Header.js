// src/components/Header.js

import React, { useState } from 'react';

const Header = ({ user, onLogout, currentPage, setCurrentPage }) => {
 const [animatingPage, setAnimatingPage] = useState(null);

 const isAdmin = user && user.role === 'admin';
 const isScanner = user && user.role === 'scanner';

  const handleTabClick = (pageName) => {
    if (pageName === currentPage || animatingPage) return;
    
    setAnimatingPage(pageName);

    setTimeout(() => {
      setCurrentPage(pageName);
      
      setAnimatingPage(null); 

    }, 700);
  };
  
  // 💡 ADDED 'code_conduct' TO THE BASE NAVIGATION ARRAY
  const navPages = ['home', 'schedule', 'map', 'alerts', 'code_conduct'];
  if (isAdmin || isScanner) navPages.push('scanner');
  if (isAdmin) navPages.push('admin');
  


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
          
          
          const buttonText = page === 'code_conduct' ? 'Code of Conduct' : 
                   page.charAt(0).toUpperCase() + page.slice(1);
          
          return (
            <button 
              key={page}
              onClick={() => handleTabClick(page)}
              className={`${isCurrent ? 'active' : ''} ${isAnimating ? 'is-animating' : ''}`}
              disabled={!!animatingPage} 
            >
              <span>{buttonText}</span>
            </button>
          );
        })}
        
   </nav>
  </header>
 );
};

export default Header;