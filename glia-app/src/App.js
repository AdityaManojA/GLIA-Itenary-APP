// src/App.js

import React, { useState, useEffect } from 'react'; // Import useEffect
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import AlertsPage from './pages/AlertsPage';
import participants from './data/participants.json';

const ADMIN_EMAILS = ["adityamanoja@gmail.com"]; 

function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('home');

  // NEW: On app start, check if a user is saved in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []); // The empty array ensures this runs only once on mount

  const handleLoginSuccess = (userData) => {
    const fullUser = participants.find(p => p.reg_no.toLowerCase() === userData.reg_no.toLowerCase());
    
    // UPDATED: Save user to localStorage
    localStorage.setItem('user', JSON.stringify(fullUser));

    setUser(fullUser);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    // UPDATED: Remove user from localStorage
    localStorage.removeItem('user');
    
    setUser(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'admin':
        return user && ADMIN_EMAILS.includes(user.email) ? <AdminPage /> : <HomePage user={user} />;
      case 'alerts':
        return <AlertsPage />;
      case 'home':
      default:
        return <HomePage user={user} />;
    }
  };

  return (
    <>
      {!user ? (
        <div className="auth-page-background">
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="app-container">
          <Header user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
          <main className="app-main">
            {renderPage()}
          </main>
        </div>
      )}
    </>
  );
}

export default App;