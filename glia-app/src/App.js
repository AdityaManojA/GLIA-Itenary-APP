import React, { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import AlertsPage from './pages/AlertsPage';
import ItineraryPage from './pages/ItineraryPage';
import MapPage from './pages/MapPage'; 
import Scanner from './components/Scanner';

function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
    const isAdmin = user && user.email === 'adityamanoja@gmail.com';
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'admin':
        return isAdmin ? <AdminPage /> : <HomePage user={user} />;
        case 'scanner':
        return isAdmin ? <Scanner /> : <HomePage user={user} />;
      case 'alerts':
        return <AlertsPage />;
      case 'itinerary':
        return <ItineraryPage />;
      // This case tells the app what to do when the map button is clicked
      case 'map':
        return <MapPage />;
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

