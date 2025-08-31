import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
// --- IMPORT NEW ITINERARY PAGE ---
import ItineraryPage from './pages/ItineraryPage';

const ADMIN_EMAILS = ["adityamanoja@gmail.com"];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // If user logs out, send them to the home page
      if (!user) {
        setCurrentPage('home');
      }
    });
    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'admin':
        return user && ADMIN_EMAILS.includes(user.email) ? <AdminPage /> : <HomePage />;
      // --- ADD ITINERARY PAGE CASE ---
      case 'itinerary':
        return user ? <ItineraryPage /> : <AuthPage />; // Only show if logged in
      case 'auth':
        return <AuthPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  if (loading) {
    return (
      <div className="auth-page-background">
        <p>Loading App...</p>
      </div>
    );
  }

  // If the user is not logged in, show the AuthPage
  if (!user) {
    return (
      <div className="auth-page-background">
        <AuthPage />
      </div>
    );
  }
  
  // If the user is logged in, show the main app layout
  return (
    <div className="app-container">
      <Header user={user} setCurrentPage={setCurrentPage} />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
