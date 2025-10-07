import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const EventDisplayCard = ({ event, itinerary, toggleItinerary }) => {
  if (!event) {
    return (
      <div className="live-display-card">
        <p className="no-event-message">No event currently scheduled for this hall.</p>
      </div>
    );
  }

  const isSaved = itinerary.has(event.id);
  const startTime = event.startTime?.toDate ? event.startTime.toDate() : event.startTime;
  const endTime = event.endTime?.toDate ? event.endTime.toDate() : event.endTime;

  return (
    <div className="live-display-card">
      <div className="live-display-main-content">
        {event.speakerImageURL && (
          <img src={event.speakerImageURL} alt={event.speakerName} className="live-display-speaker-image" />
        )}
        <h3 className="live-display-title">{event.title}</h3>
        {event.speakerName && <p className="live-display-speaker">{event.speakerName}</p>}
        {event.speakerTopic && <p className="live-display-topic">{event.speakerTopic}</p>}
        {startTime && endTime && (
            <p className="live-display-time">
                {/* UPDATED: Added date to the start time display */}
                🕒 {startTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        )}
        {event.chairpersons && (
          <div className="live-display-chairs">
            <strong>Chairperson(s):</strong> {event.chairpersons}
          </div>
        )}
      </div>
      <div className="live-display-action">
        <button 
          onClick={() => toggleItinerary(event.id, isSaved)}
          title={isSaved ? "Remove from Itinerary" : "Add to Itinerary"}
          className={`itinerary-toggle-button ${isSaved ? 'saved' : ''}`}
        >
        </button>
      </div>
    </div>
  );
};

const HappeningNow = ({ itinerary, toggleItinerary }) => {
  const [hall1Event, setHall1Event] = useState(null);
  const [hall2Event, setHall2Event] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeHall1Auto = null;
    let unsubscribeHall2Auto = null;
    const overrideDocRef = doc(db, 'live_display', 'override');
    const scheduleColRef = collection(db, 'schedule');

    const fetchEventById = async (eventId) => {
      if (!eventId) return null;
      const eventDoc = await getDoc(doc(db, 'schedule', eventId));
      return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null;
    };

    const fetchLiveEventForHall = (hallName, callback) => {
      const now = new Date();
      const q = query(
        scheduleColRef,
        where('venue', '==', hallName),
        where('startTime', '<=', now),
        orderBy('startTime', 'desc') 
      );

      return onSnapshot(q, (snapshot) => {
        const startedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const liveEvent = startedEvents.find(event => event.endTime.toDate() >= now);
        callback(liveEvent || null);
      });
    };

    const unsubscribeOverride = onSnapshot(overrideDocRef, async (docSnap) => {
      const overrideData = docSnap.exists() ? docSnap.data() : {};
      
      if (unsubscribeHall1Auto) unsubscribeHall1Auto();
      if (overrideData.hall1) {
        const event = await fetchEventById(overrideData.hall1);
        setHall1Event(event);
      } else {
        unsubscribeHall1Auto = fetchLiveEventForHall('HALL 1', setHall1Event);
      }

      if (unsubscribeHall2Auto) unsubscribeHall2Auto();
      if (overrideData.hall2) {
        const event = await fetchEventById(overrideData.hall2);
        setHall2Event(event);
      } else {
        unsubscribeHall2Auto = fetchLiveEventForHall('HALL 2', setHall2Event);
      }
      
      setLoading(false);
    });

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
            <h3>HALL 1</h3>
            <EventDisplayCard event={hall1Event} itinerary={itinerary} toggleItinerary={toggleItinerary} />
          </div>
          <div className="live-display-column">
            <h3>HALL 2</h3>
            <EventDisplayCard event={hall2Event} itinerary={itinerary} toggleItinerary={toggleItinerary} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HappeningNow;

