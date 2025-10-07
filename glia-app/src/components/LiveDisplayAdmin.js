import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';

const LiveDisplayAdmin = () => {
  const [hall1Events, setHall1Events] = useState([]);
  const [hall2Events, setHall2Events] = useState([]);
  const [override, setOverride] = useState({ hall1: null, hall2: null });
  const [loading, setLoading] = useState(true);

  const overrideDocRef = doc(db, 'live_display', 'override');

  useEffect(() => {
    const q = query(collection(db, 'schedule'), orderBy('startTime'));
    const unsubscribeEvents = onSnapshot(q, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      }));
      setHall1Events(allEvents.filter(e => e.venue === 'Hall 1'));
      setHall2Events(allEvents.filter(e => e.venue === 'Hall 2'));
      setLoading(false);
    });

    const unsubscribeOverride = onSnapshot(overrideDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setOverride(docSnap.data());
      } else {
        setDoc(overrideDocRef, {});
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeOverride();
    };
  }, [overrideDocRef]); 
  
  const handleNavigate = (hall, direction) => {
    const events = hall === 'hall1' ? hall1Events : hall2Events;
    const currentId = override[hall];
    let currentIndex = events.findIndex(e => e.id === currentId);

    if (currentIndex === -1 && events.length > 0) {
      const now = new Date();
      const liveIndex = events.findIndex(e => e.startTime <= now && e.endTime >= now);
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
        <div className="hall-control">
          <h4>Hall 1</h4>
          <div className="control-row">
            <button onClick={() => handleNavigate('hall1', -1)}>&lt;</button>
            <span className="current-event-title">{getCurrentEventTitle('hall1')}</span>
            <button onClick={() => handleNavigate('hall1', 1)}>&gt;</button>
          </div>
          <button className="reset-btn" onClick={() => handleReset('hall1')}>Reset to Auto</button>
        </div>

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

