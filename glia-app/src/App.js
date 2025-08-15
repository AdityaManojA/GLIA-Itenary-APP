

import React, { useState } from 'react';
import './App.css';


import Header from './components/Header';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/Home';

function App() {
  const [currentPage, setCurrentPage] = useState('schedule');

  return (
    <div className="app-container">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'schedule' && <SchedulePage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'home' && <HomePage/>}
    </div>
  );
}

export default App;