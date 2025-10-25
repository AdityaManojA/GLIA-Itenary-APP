import React from 'react'; 
import AlertsList from '../components/AlertsList';
import HappeningNow from '../components/HappeningNow';
// Removed: import TickerAlert from '../components/TickerAlert'; 

const HomePage = ({ user }) => {
  
  const getFirstName = (fullName) => {
    if (!fullName) return 'Attendee';
    const firstName = fullName.split(' ')[0];
    if (!firstName) return 'Attendee';
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  return (
    <div className="home-page-layout">
            
            {/* Removed: <TickerAlert /> */}

      <div className="welcome-header">
        <h1>Welcome, {getFirstName(user?.name)}</h1>
        <p>Here's what's happening at IAN 2025.</p>
      </div>

      <HappeningNow />

      <AlertsList />
      
    <div className="qr-code-home-container">
                <h3 className="qr-code-home-title">Quick Access / Scanning</h3>
                <img 
                    src="/ian2025qrcode.png" // Ensure this path is correct for your QR code image
                    alt="IAN 2025 QR Code for ian2025.in" 
                    className="qr-code-home-display" 
                />
                <a 
                    href="https://ian2025.in" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="qr-code-website-text"
                >
                    ian2025.in
                </a>
            </div>
    </div>
  );
};

export default HomePage;