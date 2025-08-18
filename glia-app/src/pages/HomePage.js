import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // This useEffect will fetch the schedule from Firebase when the component loads.
  useEffect(() => {
    const q = query(collection(db, 'schedule'), orderBy('startTime'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      }));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching schedule: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // This function finds the event that is currently happening.
  const getCurrentEvent = () => {
    const now = new Date();
    return events.find(event => now >= event.startTime && now <= event.endTime);
  };

  const currentEvent = getCurrentEvent();

  return (
    <div className="card glass-effect" style={{ textAlign: 'center' }}>
      <h1>Live Now</h1>
      
      {loading ? (
        <p>Loading current event...</p>
      ) : currentEvent ? (
        <div>
          {currentEvent.speakerImageURL && (
            <img 
              src={currentEvent.speakerImageURL} 
              alt={currentEvent.speakerName} 
              className="speaker-image-large" // Reusing style from App.css
            />
          )}
          <h2 className="event-title">{currentEvent.title}</h2>
          {currentEvent.speakerName && <p className="speaker-name">{currentEvent.speakerName}</p>}
          {currentEvent.designation && <p className="speaker-designation">{currentEvent.designation}</p>}
          <div className="event-detail">
            <span>📍 {currentEvent.venue}</span>
          </div>
          <div className="event-detail">
            <span>🕒 {currentEvent.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {currentEvent.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      ) : (
        <p>No event is currently in session. Please check the full schedule.</p>
      )}
    </div>
  );
};

export default HomePage;
