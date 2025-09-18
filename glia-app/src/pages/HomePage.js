import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import AlertsList from '../components/AlertsList';

const HomePage = () => {
  const [liveEvent, setLiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    
    // 1. Query Firestore for all events that have already started.
    // We order by startTime descending to get the most recently started events first.
    const q = query(
      collection(db, 'schedule'), 
      where('startTime', '<=', now),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // 2. Filter the results on the client-side to find the one that is still ongoing.
      const startedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentLiveEvent = startedEvents.find(event => event.endTime.toDate() >= now);

      if (currentLiveEvent) {
        setLiveEvent(currentLiveEvent);
      } else {
        setLiveEvent(null);
      }
      setLoading(false);
    }, (error) => {
        // Added error handling for permission issues
        console.error("Error fetching live schedule:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home-page-layout">
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
      <AlertsList />
    </div>
  );
};

export default HomePage;

