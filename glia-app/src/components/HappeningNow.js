// src/components/HappeningNow.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// EventDisplayCard (MODIFIED to hide speaker info AND venue for LUNCH events)
const EventDisplayCard = ({ event }) => {
  if (!event) {
    return (
      <div className="live-display-card">
        <p className="no-event-message">No event currently scheduled for this hall.</p>
      </div>
    );
  }

  const startTime = event.startTime?.toDate ? event.startTime.toDate() : event.startTime;
  const endTime = event.endTime?.toDate ? event.endTime.toDate() : event.endTime;

  // Check if the event venue is LUNCH (case-insensitive)
  const isMealEvent = event.venue?.toUpperCase() === 'LUNCH'; 

  return (
    <div className="live-display-card">
      <div className="live-display-main-content">
        
        {/* Speaker Image: Hide for LUNCH events */}
        {event.speakerImageURL && !isMealEvent && (
          <img src={event.speakerImageURL} alt={event.speakerName} className="live-display-speaker-image" />
        )}
        
        <h3 className="live-display-title">{event.title}</h3>
        
        {/* Speaker Name: Hide for LUNCH events */}
        {event.speakerName && !isMealEvent && <p className="live-display-speaker">{event.speakerName}</p>}
        
        {/* Speaker Topic: Hide for LUNCH events */}
        {event.speakerTopic && !isMealEvent && <p className="live-display-topic">{event.speakerTopic}</p>}
        
        {startTime && endTime && (
          <p className="live-display-time">
            🕒 {startTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        
        {/* ❌ VENUE DISPLAY: Hide for LUNCH events */}
        {!isMealEvent && (
                    <p className="live-display-venue">
            📍 {event.venue}
          </p>
                )}
        
        {/* Chairpersons: Hide for LUNCH events */}
        {event.chairpersons && !isMealEvent && (
          <div className="live-display-chairs">
            <strong>Chairperson(s):</strong> {event.chairpersons}
          </div>
        )}
      </div>
    </div>
  );
};


// HappeningNow component with structured layout logic
const HappeningNow = () => {
  const [vizhinjamEvent, setVizhinjamEvent] = useState(null);
  const [lightHouseEvent, setLightHouseEvent] = useState(null);
  const [bayAndWavesEvent, setBayAndWavesEvent] = useState(null);
  const [lunchEvent, setLunchEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW VENUE CONSTANTS
    const HALL1_NAME = 'Hall 1 (Vizhinjam)';
    const HALL2_NAME = 'Hall 2 (Light House)';
    const HALL3_4_NAME = 'Halls 3 & 4 (Bay & Waves)';
    const LUNCH_NAME = 'LUNCH';

  useEffect(() => {
    let unsubscribeVizhinjamAuto = null;
    let unsubscribeLightHouseAuto = null;
    let unsubscribeBayAndWavesAuto = null;
    let unsubscribeLunchAuto = null;
   
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
     
      // Hall 1 (Vizhinjam) Logic
      if (unsubscribeVizhinjamAuto) unsubscribeVizhinjamAuto();
      if (overrideData.hall1) {
        const event = await fetchEventById(overrideData.hall1);
        setVizhinjamEvent(event);
      } else {
        unsubscribeVizhinjamAuto = fetchLiveEventForHall(HALL1_NAME, setVizhinjamEvent);
      }

      // Hall 2 (Light House) Logic
      if (unsubscribeLightHouseAuto) unsubscribeLightHouseAuto();
      if (overrideData.hall2) {
        const event = await fetchEventById(overrideData.hall2);
        setLightHouseEvent(event);
      } else {
        unsubscribeLightHouseAuto = fetchLiveEventForHall(HALL2_NAME, setLightHouseEvent);
      }
     
      // Halls 3 & 4 (Bay & Waves) Logic
      if (unsubscribeBayAndWavesAuto) unsubscribeBayAndWavesAuto();
      unsubscribeBayAndWavesAuto = fetchLiveEventForHall(HALL3_4_NAME, setBayAndWavesEvent);
     
      // LUNCH Logic
      if (unsubscribeLunchAuto) unsubscribeLunchAuto();
      unsubscribeLunchAuto = fetchLiveEventForHall(LUNCH_NAME, setLunchEvent);

      setLoading(false);
    });

    return () => {
      unsubscribeOverride();
      if (unsubscribeVizhinjamAuto) unsubscribeVizhinjamAuto();
      if (unsubscribeLightHouseAuto) unsubscribeLightHouseAuto();
      if (unsubscribeBayAndWavesAuto) unsubscribeBayAndWavesAuto();
      if (unsubscribeLunchAuto) unsubscribeLunchAuto();
    };
  }, []);

  if (loading) {
    return (
      <div className="card glass-effect">
        <h2 style={{ textAlign: 'center' }}>Happening Now</h2>
        <p style={{ textAlign: 'center' }}>Loading live schedule...</p>
      </div>
    );
  }
 
  // Determine which events are live
  const hasVizhinjamEvent = vizhinjamEvent !== null;
  const hasLightHouseEvent = lightHouseEvent !== null;
  const hasBayAndWavesEvent = bayAndWavesEvent !== null;
  const hasLunchEvent = lunchEvent !== null;

  const isRow1Active = hasVizhinjamEvent || hasLightHouseEvent;
  const isRow2Active = hasBayAndWavesEvent || hasLunchEvent;
    
    // Check if only one event is active in Row 2
    const isRow2SingleColumn = (hasBayAndWavesEvent && !hasLunchEvent) || (!hasBayAndWavesEvent && hasLunchEvent);


  const totalActiveRows = (isRow1Active ? 1 : 0) + (isRow2Active ? 1 : 0);

  return (
    <div className="card glass-effect">
      <h2 style={{ textAlign: 'center' }}>Happening Now</h2>
     
      <div className="live-display-container-wrapper">
        {totalActiveRows === 0 && (
          <p style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
            Nothing is currently scheduled or live.
          </p>
        )}

        {/* ROW 1: Hall 1 (Vizhinjam) and Hall 2 (Light House) */}
        {isRow1Active && (
          <div className="live-display-row two-column-row">
            {/* Hall 1 (Vizhinjam) */}
            <div className="live-display-column">
              <h3>{HALL1_NAME}</h3>
              <EventDisplayCard event={vizhinjamEvent} />
            </div>

            {/* Hall 2 (Light House) */}
            <div className="live-display-column">
              <h3>{HALL2_NAME}</h3>
              <EventDisplayCard event={lightHouseEvent} />
            </div>
          </div>
        )}


        {isRow2Active && (
                    
                    <div className={`live-display-row ${isRow2SingleColumn ? 'single-column-row' : 'two-column-row'}`}>
                        
                        {hasBayAndWavesEvent && (
                            <div className="live-display-column">
                                <h3>{HALL3_4_NAME}</h3>
                                <EventDisplayCard event={bayAndWavesEvent} /> 
                            </div>
                        )}
                        
                        {hasLunchEvent && (
                            <div className="live-display-column">
                                <h3>{LUNCH_NAME}</h3>
                                <EventDisplayCard event={lunchEvent} /> 
                            </div>
                        )}
                    </div>
                )}
      </div>
    </div>
  );
};

export default HappeningNow;