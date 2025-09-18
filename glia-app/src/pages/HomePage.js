import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import AlertsList from '../components/AlertsList';

const HomePage = ({ user }) => {
  const [liveEvent, setLiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // A helper function to get the user's first name for the greeting
  const getFirstName = (fullName) => {
    if (!fullName) return 'Attendee'; // Fallback name
    return fullName.split(' ')[0];
  };

  // This useEffect fetches the currently live event from Firestore
  useEffect(() => {
    const now = new Date();
    
    const q = query(
      collection(db, 'schedule'), 
      where('startTime', '<=', now),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const startedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentLiveEvent = startedEvents.find(event => event.endTime.toDate() >= now);

      setLiveEvent(currentLiveEvent || null);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching live schedule:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home-page-layout">
      {/* Personalized Welcome Message */}
      <div className="welcome-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {getFirstName(user?.name)}</h1>
        <p>Here's what's happening now at IAN 2025.</p>
      </div>

      {/* Live Now Card */}
      <div className="card glass-effect" style={{ textAlign: 'center' }}>
        <h2>Live Now</h2>
        {loading ? (
          <p>Checking schedule...</p>
        ) : liveEvent ? (
          <div>
            {liveEvent.speakerImageURL && <img src={liveEvent.speakerImageURL} alt={liveEvent.speakerName} className="speaker-image-large" />}
            <h3 className="event-title">{liveEvent.title}</h3>
            {liveEvent.speakerName && <p className="speaker-name">{liveEvent.speakerName}</p>}
            {liveEvent.designation && <p className="speaker-designation">{liveEvent.designation}</p>}
            <div className="event-detail">
              <span>📍 {liveEvent.venue}</span>
            </div>
          </div>
        ) : (
          <p>No event is currently in session. Please check the full schedule.</p>
        )}
      </div>

      {/* Recent Alerts List */}
      <AlertsList />
    </div>
  );
};

export default HomePage;

