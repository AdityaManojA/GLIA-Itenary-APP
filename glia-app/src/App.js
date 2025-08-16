import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import './App.css';

import Header from './components/Header';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage'; 

// IMPORTANT: Make sure this email matches the admin user you created in the Firebase console.
const ADMIN_EMAIL = "admin@ian2025.com";

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This Firebase listener is the heart of the authentication.
    // It automatically updates the 'user' state whenever someone logs in or out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // This function decides which main page to show *after* a user is logged in.
  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'admin':
        // This protects the admin page.
        // It checks if the logged-in user's email matches the admin email.
        return user && user.email === ADMIN_EMAIL ? <AdminPage /> : <HomePage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  // While Firebase is checking the auth state, show a loading screen.
  // This prevents the login page from flashing on screen for already logged-in users.
  if (loading) {
    return (
      <div className="auth-page-background">
        <p style={{ color: 'white', fontSize: '1.2rem' }}>Loading App...</p>
      </div>
    );
  }

  // This is the main gatekeeper for your app.
  return (
    <div className="app-container">
      {!user ? (
        // --- IF NOT LOGGED IN ---
        // Render ONLY the authentication page with its special background.
        <div className="auth-page-background">
            <AuthPage />
        </div>
      ) : (
        // --- IF LOGGED IN ---
        // Render the full app layout with the Header and the current page.
        <>
          <Header user={user} setCurrentPage={setCurrentPage} />
          <div className="app-main">
            {renderPage()}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
