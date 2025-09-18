import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import AlertsList from '../components/AlertsList'; // We'll keep this for now

const HomePage = ({ user }) => {
  const [liveEvents, setLiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Attendee';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const now = new Date();
    
    // Query for events that are currently live
    const liveQuery = query(
      collection(db, 'schedule'),
      where('startTime', '<=', now),
      orderBy('startTime', 'desc')
    );

    // Query for the next 3 upcoming events
    const upcomingQuery = query(
        collection(db, 'schedule'),
        where('startTime', '>', now),
        orderBy('startTime', 'asc'),
        limit(3)
    );

    const unsubscribeLive = onSnapshot(liveQuery, (snapshot) => {
      const allStartedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter to find events that haven't ended yet
      const currentLiveEvents = allStartedEvents.filter(event => event.endTime.toDate() > now);
      setLiveEvents(currentLiveEvents);
      setLoading(false);
    });

    const unsubscribeUpcoming = onSnapshot(upcomingQuery, (snapshot) => {
        const upcomingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUpcomingEvents(upcomingData);
    });

    return () => {
        unsubscribeLive();
        unsubscribeUpcoming();
    };
  }, []);

  const renderEventCard = (event, isLive = false) => (
    <div key={event.id} className={`event-card ${isLive ? 'live' : ''}`}>
        {event.speakerImageURL && <img src={event.speakerImageURL} alt={event.speakerName} className="speaker-image-large" />}
        <h3 className="event-title">{event.title}</h3>
        {event.speakerName && <p className="speaker-name">{event.speakerName}</p>}
        {event.designation && <p className="speaker-designation">{event.designation}</p>}
        <div className="event-detail">
            <span>📍 {event.venue}</span>
            <span>🕒 {event.startTime.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    </div>
  );

  return (
    <div className="home-page-layout">
      <div className="welcome-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {getFirstName(user?.name)}</h1>
        <p>Here's what's happening at IAN 2025.</p>
      </div>

      {/* Live Now Section */}
      <div className="card glass-effect">
        <h2>Happening Now</h2>
        {loading ? (
          <p>Checking schedule...</p>
        ) : liveEvents.length > 0 ? (
          liveEvents.map(event => renderEventCard(event, true))
        ) : (
          <p>No event is currently in session. See what's up next!</p>
        )}
      </div>

      {/* Up Next Section */}
      <div className="card glass-effect">
          <h2>Up Next</h2>
          {loading ? (
              <p>Loading upcoming events...</p>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => renderEventCard(event, false))
          ) : (
              <p>No upcoming events scheduled at the moment.</p>
          )}
      </div>

      {/* Recent Alerts List */}
      <AlertsList />
    </div>
  );
};

export default HomePage;