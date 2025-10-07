import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// This is a reusable card for displaying a single event
const EventDisplayCard = ({ event }) => {
  if (!event) {
    return (
      <div className="live-display-card">
        <p className="no-event-message">No event currently scheduled for this hall.</p>
      </div>
    );
  }

  return (
    <div className="live-display-card">
      {event.speakerImageURL && (
        <img src={event.speakerImageURL} alt={event.speakerName} className="live-display-speaker-image" />
      )}
      <h3 className="live-display-title">{event.title}</h3>
      {event.speakerName && <p className="live-display-speaker">{event.speakerName}</p>}
      {event.speakerTopic && <p className="live-display-topic">{event.speakerTopic}</p>}
      {event.chairpersons && (
        <div className="live-display-chairs">
          <strong>Chairperson(s):</strong> {event.chairpersons}
        </div>
      )}
    </div>
  );
};

const HappeningNow = () => {
  const [hall1Event, setHall1Event] = useState(null);
  const [hall2Event, setHall2Event] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const overrideDocRef = doc(db, 'live_display', 'override');
    const scheduleColRef = collection(db, 'schedule');
    const now = new Date();

    // This function fetches an event based on an ID
    const fetchEventById = async (eventId) => {
      if (!eventId) return null;
      const eventDoc = await getDoc(doc(db, 'schedule', eventId));
      return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null;
    };

    // This function finds a live event based on the current time for a specific hall
    const fetchLiveEventForHall = (hallName, callback) => {
      const q = query(
        scheduleColRef,
        where('venue', '==', hallName),
        where('startTime', '<=', now),
        where('endTime', '>=', now)
      );
      return onSnapshot(q, (snapshot) => {
        const liveEvent = snapshot.docs.length > 0 
          ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } 
          : null;
        callback(liveEvent);
      });
    };

    // Main listener for overrides
    const unsubscribeOverride = onSnapshot(overrideDocRef, async (docSnap) => {
      const overrideData = docSnap.exists() ? docSnap.data() : {};

      // Handle Hall 1
      if (overrideData.hall1) {
        const event = await fetchEventById(overrideData.hall1);
        setHall1Event(event);
      } else {
        // If no override, let the time-based listener handle it
        if (unsubscribeHall1Auto) unsubscribeHall1Auto(); // Stop previous listener
        var unsubscribeHall1Auto = fetchLiveEventForHall('Hall 1', setHall1Event);
      }

      // Handle Hall 2
      if (overrideData.hall2) {
        const event = await fetchEventById(overrideData.hall2);
        setHall2Event(event);
      } else {
        if (unsubscribeHall2Auto) unsubscribeHall2Auto();
        var unsubscribeHall2Auto = fetchLiveEventForHall('Hall 2', setHall2Event);
      }
      
      setLoading(false);
    });

    // Initial listeners for auto mode if no overrides are set
    let unsubscribeHall1Auto = fetchLiveEventForHall('Hall 1', setHall1Event);
    let unsubscribeHall2Auto = fetchLiveEventForHall('Hall 2', setHall2Event);

    return () => {
      unsubscribeOverride();
      if (unsubscribeHall1Auto) unsubscribeHall1Auto();
      if (unsubscribeHall2Auto) unsubscribeHall2Auto();
    };
  }, []);

  return (
    <div className="card glass-effect">
      <h2 style={{ textAlign: 'center' }}>Happening Now</h2>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading live schedule...</p>
      ) : (
        <div className="live-display-container">
          <div className="live-display-column">
            <h3>Hall 1</h3>
            <EventDisplayCard event={hall1Event} />
          </div>
          <div className="live-display-column">
            <h3>Hall 2</h3>
            <EventDisplayCard event={hall2Event} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HappeningNow;
