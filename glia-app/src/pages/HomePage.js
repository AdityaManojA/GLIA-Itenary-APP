import React from 'react'; 
import AlertsList from '../components/AlertsList';
import HappeningNow from '../components/HappeningNow';

const HomePage = ({ user }) => {

const getFirstName = (fullName) => {
  if (!fullName) return 'Attendee';
   
   // Trim whitespace, then split by space
  const nameParts = fullName.trim().split(' ');
   
   // If the first part exists, capitalize it and return it
  if (nameParts[0]) {
    const firstName = nameParts[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }
   
   // Fallback if the trimmed string was empty (e.g., name was just spaces)
   return 'Attendee'; 
};

return (
 <div className="home-page-layout">
   
 <div className="welcome-header">
  <h1>Welcome, {getFirstName(user?.name)}</h1>
  <p>Here's what's happening at IAN 2025.</p>
 </div>

 <HappeningNow />

 <AlertsList />
 
 {/* QR Code Container is placed here, beneath AlertsList
 <div className="qr-code-home-container">
    <h3 className="qr-code-home-title">Quick Access / Scanning</h3>
    <img 
     src="/ian2025qrcode.png" 
     alt="IAN 2025 QR Code for ian2025.in" 
     className="qr-code-home-display" 
    />
   </div> */}
 </div>
);
};

export default HomePage;