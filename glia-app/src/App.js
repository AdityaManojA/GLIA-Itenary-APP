import React, { useState, useEffect } from 'react';
import './App.css';

import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AdminPage from './pages/AdminPage';
import AlertsPage from './pages/AlertsPage';
import MapPage from './pages/MapPage';
import ScannerPage from './pages/ScannerPage';

function App() {
    const [user, setUser] = useState(null); 
    const [currentPage, setCurrentPage] = useState('home');
    const [isLoadingInitialUser, setIsLoadingInitialUser] = useState(true); 

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoadingInitialUser(false); 
    }, []);

    const handleLoginSuccess = (completeUserData) => {
        // Clear the old user session before saving the new one 
        localStorage.removeItem('user'); 
        
        localStorage.setItem('user', JSON.stringify(completeUserData));
        setUser(completeUserData);
        setCurrentPage('home');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setCurrentPage('home'); // Redirect to home on logout
    };

    const renderPage = () => {
        const isAdmin = user && user.role === 'admin';
        const isScanner = user && user.role === 'scanner';

        switch (currentPage) {
            case 'schedule':
                return <SchedulePage />;
            case 'admin':
                return isAdmin ? <AdminPage /> : <HomePage user={user} />;
            case 'alerts':
                return <AlertsPage />;
          
            case 'map':
                return <MapPage />;
            case 'scanner':
                return (isAdmin || isScanner) ? <ScannerPage /> : <HomePage user={user} />;
            case 'home':
            default:
                return <HomePage user={user} />;
        }
    };

    if (isLoadingInitialUser) {
        return <div className="loading-screen"><p>Loading session...</p></div>; 
    }

    return (
        <>
            {!user ? (
                <div className="auth-page-background">
                    <AuthPage onLoginSuccess={handleLoginSuccess} />
                </div>
            ) : (
                <div className="app-container">
                    <Header user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
                    {renderPage()}
                </div>
            )}
        </>
    );
}

export default App;