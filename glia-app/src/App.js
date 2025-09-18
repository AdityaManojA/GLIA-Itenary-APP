// src/App.js

import React, {useState} from 'react';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import AlertsPage from './pages/AlertsPage'; // Import the new page
import participants from './data/participants.json';

const ADMIN_EMAILS = ["adityamanoja@gmail.com"]; 

function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('home');

  const handleLoginSuccess = (userData) => {
    const fullUser = participants.find(p => p.reg_no.toLowerCase() === userData.reg_no.toLowerCase());
    setUser(fullUser);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'admin':
        return user && ADMIN_EMAILS.includes(user.email) ? <AdminPage /> : <HomePage user={user} />;
      
      // New case for the alerts page
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