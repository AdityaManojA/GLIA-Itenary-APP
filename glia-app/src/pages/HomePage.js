import React from 'react'; 
import AlertsList from '../components/AlertsList';
import HappeningNow from '../components/HappeningNow';

const HomePage = ({ user }) => {

    
    const getFirstName = (fullName) => {
        if (!fullName) return 'Attendee';
        const firstName = fullName.split(' ')[0];
        if (!firstName) return 'Attendee';
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    };

    return (
        <div className="home-page-layout">
            <div className="welcome-header">
                <h1>Welcome, {getFirstName(user?.name)}</h1>
                <p>Here's what's happening at IAN 2025.</p>
            </div>

            {/* HappeningNow component is now simpler, no itinerary props needed */}
            <HappeningNow 
                // ❌ REMOVED: itinerary={itinerary}
                // ❌ REMOVED: toggleItinerary={toggleItinerary}
            />

            <AlertsList />
        </div>
    );
};

export default HomePage;