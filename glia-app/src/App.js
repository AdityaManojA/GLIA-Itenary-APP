// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import AlertsPage from './pages/AlertsPage';
import ItineraryPage from './pages/ItineraryPage';
// participants.json is no longer needed here for login logic
// import participants from './data/participants.json'; 

const ADMIN_EMAILS = ["adityamanoja@gmail.com"]; 

function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // UPDATED AND SIMPLIFIED: This is the key change.
  // This function now directly accepts the complete user object from AuthPage.
  const handleLoginSuccess = (completeUserData) => {
    localStorage.setItem('user', JSON.stringify(completeUserData));
    setUser(completeUserData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
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
      case 'itinerary':
        return <ItineraryPage />;
      case 'home':
      default:
        return <HomePage user={user} />;
    }
  };
  
  // This console.log can now be removed if you wish, or kept for debugging.
  // console.log("Current User Object:", user); 

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