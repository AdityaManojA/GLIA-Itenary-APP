// src/components/Header.js

import React from 'react';

const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="app-header">
      <h1>GLIA</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
        
         <button 
          onClick={() => setCurrentPage('home')}
          className={currentPage === 'home' ? 'active' : ''}
        >
          Home
        </button>

          <button 
            onClick={() => setCurrentPage('schedule')}
            className={currentPage === 'schedule' ? 'active' : ''}
          >
            Schedule
          </button>
          <button 
            onClick={() => setCurrentPage('admin')}
            className={currentPage === 'admin' ? 'active' : ''}
          >
            Admin
          </button>
      </nav>
    </header>
  );
};

export default Header;