import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

import Header from './components/Header';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage'; 

const ADMIN_EMAIL = "admin@ian2025.com";

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'admin':
        return user && user.email === ADMIN_EMAIL ? <AdminPage /> : <HomePage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  if (loading) {
    return (
      <div className="auth-page-background">
        <p style={{ color: 'white', fontSize: '1.2rem' }}>Loading App...</p>
      </div>
    );
  }

  // This is the final, corrected layout logic.
  return (
    <>
      {!user ? (
        // --- IF NOT LOGGED IN ---
        // The AuthPage now lives in its own dedicated container.
        <div className="auth-page-background">
            <AuthPage />
        </div>
      ) : (
        // --- IF LOGGED IN ---
        // The main app has its own container.
        <div className="app-container">
          <Header user={user} setCurrentPage={setCurrentPage} className="glass-effect" />
          <div className="app-main">
            {renderPage()}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
