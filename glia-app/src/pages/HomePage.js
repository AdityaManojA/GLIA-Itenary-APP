import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import AlertsList from '../components/AlertsList'; 

const HomePage = () => {
  const [liveEvent, setLiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    
    const q = query(
      collection(db, 'schedule'), 
      where('startTime', '<=', now),
      where('endTime', '>=', now)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const eventData = snapshot.docs[0].data();
        setLiveEvent({ id: snapshot.docs[0].id, ...eventData });
      } else {
        setLiveEvent(null);
      }
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
