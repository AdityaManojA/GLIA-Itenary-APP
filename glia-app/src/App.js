import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import ItineraryPage from './pages/ItineraryPage';
import NotificationListener from './components/NotificationListener';

const ADMIN_EMAILS = ["adityamanoja@gmail.com"];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentPage('home');
      }
    });
    return unsubscribe;
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'itinerary':
        return <ItineraryPage user={user} />;
      case 'admin':
        return user && ADMIN_EMAILS.includes(user.email) ? <AdminPage /> : <HomePage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading App...</div>;
  }

  return (
    <>
      {!user ? (
        <div className="auth-page-background">
          <AuthPage />
        </div>
      ) : (
        <div className="app-container">
          <NotificationListener /> 
          <Header user={user} setCurrentPage={setCurrentPage} />
          <main className="app-main">
            {renderPage()}
          </main>
        </div>
      )}
    </>
  );
}

export default App;
