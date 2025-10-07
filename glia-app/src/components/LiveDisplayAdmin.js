import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';

const LiveDisplayAdmin = () => {
  const [hall1Events, setHall1Events] = useState([]);
  const [hall2Events, setHall2Events] = useState([]);
  const [override, setOverride] = useState({ hall1: null, hall2: null });
  const [loading, setLoading] = useState(true);

  const overrideDocRef = doc(db, 'live_display', 'override');

  useEffect(() => {
    // Fetch all events and sort them into halls
    const q = query(collection(db, 'schedule'), orderBy('startTime'));
    const unsubscribeEvents = onSnapshot(q, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHall1Events(allEvents.filter(e => e.venue === 'Hall 1'));
      setHall2Events(allEvents.filter(e => e.venue === 'Hall 2'));
      setLoading(false);
    });

    // Listen for current override settings
    const unsubscribeOverride = onSnapshot(overrideDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setOverride(docSnap.data());
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeOverride();
    };
  }, []);
  
  const handleNavigate = (hall, direction) => {
    const events = hall === 'hall1' ? hall1Events : hall2Events;
    const currentId = override[hall];
    let currentIndex = events.findIndex(e => e.id === currentId);

    if (currentIndex === -1 && events.length > 0) {
      // If no override is set, find the naturally live event to start from
      const now = new Date();
      const liveIndex = events.findIndex(e => e.startTime.toDate() <= now && e.endTime.toDate() >= now);
      currentIndex = liveIndex !== -1 ? liveIndex : 0;
    }

    let nextIndex = currentIndex + direction;

    if (nextIndex >= events.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = events.length - 1;

    const nextEventId = events[nextIndex]?.id;
    if (nextEventId) {
      updateDoc(overrideDocRef, { [hall]: nextEventId });
    }
  };

  const handleReset = (hall) => {
    // To reset, we remove the field from the override document
    updateDoc(overrideDocRef, { [hall]: deleteField() });
  };
  
  const getCurrentEventTitle = (hall) => {
    const events = hall === 'hall1' ? hall1Events : hall2Events;
    const event = events.find(e => e.id === override[hall]);
    return event ? event.title : 'Automatic (Time-based)';
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h2>Manual Live Display Override</h2>
      <p style={{ opacity: 0.8, marginTop: 0, color: 'var(--text-secondary)' }}>
        Use these controls to manually set what's displayed on the "Happening Now" screen.
      </p>

      <div className="live-admin-controls">
        {/* Hall 1 Controls */}
        <div className="hall-control">
          <h4>Hall 1</h4>
          <div className="control-row">
            <button onClick={() => handleNavigate('hall1', -1)}>&lt;</button>
            <span className="current-event-title">{getCurrentEventTitle('hall1')}</span>
            <button onClick={() => handleNavigate('hall1', 1)}>&gt;</button>
          </div>
          <button className="reset-btn" onClick={() => handleReset('hall1')}>Reset to Auto</button>
        </div>

        {/* Hall 2 Controls */}
        <div className="hall-control">
          <h4>Hall 2</h4>
          <div className="control-row">
            <button onClick={() => handleNavigate('hall2', -1)}>&lt;</button>
            <span className="current-event-title">{getCurrentEventTitle('hall2')}</span>
            <button onClick={() => handleNavigate('hall2', 1)}>&gt;</button>
          </div>
          <button className="reset-btn" onClick={() => handleReset('hall2')}>Reset to Auto</button>
        </div>
      </div>
    </div>
  );
};

export default LiveDisplayAdmin;

