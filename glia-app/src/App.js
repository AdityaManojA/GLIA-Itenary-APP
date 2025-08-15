// src/App.js

import React, { useState } from 'react';
import './App.css';

// Import your new components and pages
import Header from './components/Header';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';

function App() {
  const [currentPage, setCurrentPage] = useState('schedule');

  return (
    <div className="app-container">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'schedule' && <SchedulePage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
}

export default App;