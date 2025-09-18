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

// Define your list of admin emails
const ADMIN_EMAILS = ["adityamanoja@gmail.com"];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // This listener checks if the user is logged in or out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setCurrentPage('home'); // Go to home page after login
      }
    });
    return unsubscribe; // Cleanup the listener
  }, []);

  // This function decides which page component to show
  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage user={user} />;
      case 'itinerary':
        return <ItineraryPage user={user} />;
      case 'admin':
        // Only show AdminPage if the user's email is in the admin list
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
      {/* If no user is logged in, show the AuthPage */}
      {!user ? (
        <div className="auth-page-background">
          <AuthPage />
        </div>
      ) : (
        // If a user is logged in, show the main app
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

