import React, {useState} from 'react';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import participants from './data/participants.json'; // Import the local participant data

// Define your list of admin emails here
const ADMIN_EMAILS = ["adityamanoja@gmail.com"]; 

function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState('home');

  const handleLoginSuccess = (userData) => {
    // On login, find the full user profile from our local JSON
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
      case 'home':
      default:
        // Pass the full user object to the HomePage
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

