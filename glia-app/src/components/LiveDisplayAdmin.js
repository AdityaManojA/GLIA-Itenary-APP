import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';


const CurrentEventDetails = ({ event }) => {
if (!event) {
return (
<div className="current-event-details">
 <p><strong>Currently Displaying:</strong></p>
 <p>Automatic (Time-based)</p>
</div>
);
}

const startTime = event.startTime?.toDate ? event.startTime.toDate() : event.startTime;
const endTime = event.endTime?.toDate ? event.endTime.toDate() : event.endTime;

return (
<div className="current-event-details">
<p><strong>Currently Displaying:</strong></p>
<p className="details-title">{event.title}</p>
{event.speakerName && <p>{event.speakerName}</p>}
{event.speakerTopic && <p><em>{event.speakerTopic}</em></p>}
{startTime && endTime && (
 <p>🕒 {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
)}
{event.chairpersons && <p><strong>Chairs:</strong> {event.chairpersons}</p>}
</div>
);
};


const FullEventList = ({ title, events }) => {
const formatDate = (date) => {
return new Date(date).toLocaleDateString([], {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

return (
<div className="admin-event-list-column">
<h4>{title}</h4>
<ul className="admin-event-list">
 {events.map(event => (
 <li key={event.id} className="admin-event-item">
 <span className="event-date">{formatDate(event.startTime)}</span>
 <p className="event-item-title">{event.title}</p>
 {event.speakerTopic && <p className="event-item-topic">{event.speakerTopic}</p>}
 </li>
 ))}
</ul>
</div>
);
};

// Global Constants
const HALL1_NAME = 'Hall 1 (Vizhinjam)';
const HALL2_NAME = 'Hall 2 (Light House)';
const HALL3_4_NAME = 'Halls 3 & 4 (Bay & Waves)';
const LUNCH_NAME = 'LUNCH';
const TEA_POSTER_NAME = 'Tea and Poster Session (supported by ISDN)'; // Kept for filtering


const LiveDisplayAdmin = () => {
const [vizhinjamEvents, setVizhinjamEvents] = useState([]);
const [lightHouseEvents, setLightHouseEvents] = useState([]);
const [bayAndWavesEvents, setBayAndWavesEvents] = useState([]);
   const [lunchEvents, setLunchEvents] = useState([]); // Combined Lunch/Break/Poster events
const [override, setOverride] = useState({ hall1: null, hall2: null, hall3_4: null, lunch_break: null }); 
const [loading, setLoading] = useState(true);
const [feedback, setFeedback] = useState({ hall1: '', hall2: '', hall3_4: '', lunch_break: '' }); 

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
   

 setVizhinjamEvents(allEvents.filter(e => e.venue === HALL1_NAME));
 setLightHouseEvents(allEvents.filter(e => e.venue === HALL2_NAME));
 setBayAndWavesEvents(allEvents.filter(e => e.venue === HALL3_4_NAME));
      

      setLunchEvents(allEvents.filter(e => 
          e.venue === LUNCH_NAME || 
          e.venue === TEA_POSTER_NAME 
      ));

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
}, []); 

const showFeedback = (hall, message) => {
 setFeedback(prev => ({ ...prev, [hall]: message }));
 setTimeout(() => {
 setFeedback(prev => ({ ...prev, [hall]: '' }));
 }, 2500);
};

const getEventsArray = (hall) => {
  switch (hall) {
   case 'hall1':
    return vizhinjamEvents;
   case 'hall2':
    return lightHouseEvents;
         case 'hall3_4': 
             return bayAndWavesEvents;
         case 'lunch_break': 
             return lunchEvents;
   default:
    return [];
  }
};


const handleNavigate = (hall, direction) => {
  const events = getEventsArray(hall);
  if (events.length === 0) return;

  const currentId = override[hall];
  let currentIndex = events.findIndex(e => e.id === currentId);

  if (currentIndex === -1) {
  const now = new Date();
  const liveIndex = events.findIndex(e => e.startTime <= now && e.endTime >= now);
  currentIndex = liveIndex !== -1 ? liveIndex : 0;
  }

  let nextIndex = currentIndex + direction;

  if (nextIndex >= events.length) nextIndex = 0;
  if (nextIndex < 0) nextIndex = events.length - 1;

  const nextEventId = events[nextIndex]?.id;
  if (nextEventId) {
  updateDoc(overrideDocRef, { [hall]: nextEventId })
   .then(() => showFeedback(hall, 'Display updated!'));
  }
};

const handleReset = (hall) => {
 updateDoc(overrideDocRef, { [hall]: deleteField() })
 .then(() => showFeedback(hall, 'Reset to Automatic.'));
};

const getCurrentEvent = (hall) => {
  const events = getEventsArray(hall);
  return events.find(e => e.id === override[hall]);
};

if (loading) return <p>Loading events...</p>;
 
return (
 <div>
 <h2>Manual Live Display Override</h2>
 <p style={{ opacity: 0.8, marginTop: 0, color: 'var(--text-secondary)' }}>
  Use these controls to manually set what's displayed on the "Happening Now" screen for the main halls.
 </p>

 <div className="live-admin-controls">
  <div className="hall-control">
  <h4>{HALL1_NAME}</h4>
  <div className="control-row">
   <button onClick={() => handleNavigate('hall1', -1)}>&lt;</button>
   <span className="current-event-title">Navigate</span>
   <button onClick={() => handleNavigate('hall1', 1)}>&gt;</button>
  </div>
  <button className="reset-btn" onClick={() => handleReset('hall1')}>Reset to Auto</button>
  <p className="admin-feedback-text">{feedback.hall1}</p>
  <CurrentEventDetails event={getCurrentEvent('hall1')} />
  </div>

  <div className="hall-control">
  <h4>{HALL2_NAME}</h4>
  <div className="control-row">
   <button onClick={() => handleNavigate('hall2', -1)}>&lt;</button>
   <span className="current-event-title">Navigate</span>
   <button onClick={() => handleNavigate('hall2', 1)}>&gt;</button>
  </div>
  <button className="reset-btn" onClick={() => handleReset('hall2')}>Reset to Auto</button>
  <p className="admin-feedback-text">{feedback.hall2}</p>
  <CurrentEventDetails event={getCurrentEvent('hall2')} />
  </div>
 </div>
    
    <div className="live-admin-controls">
        <div className="hall-control">
            <h4>{HALL3_4_NAME}</h4>
            <div className="control-row">
                <button onClick={() => handleNavigate('hall3_4', -1)}>&lt;</button>
                <span className="current-event-title">Navigate</span>
                <button onClick={() => handleNavigate('hall3_4', 1)}>&gt;</button>
            </div>
            <button className="reset-btn" onClick={() => handleReset('hall3_4')}>Reset to Auto</button>
            <p className="admin-feedback-text">{feedback.hall3_4}</p>
            <CurrentEventDetails event={getCurrentEvent('hall3_4')} />
        </div>

        <div className="hall-control">
            <h4>General Lunch/Break Override</h4>
            <div className="control-row">
                <button onClick={() => handleNavigate('lunch_break', -1)}>&lt;</button>
                <span className="current-event-title">Navigate</span>
                <button onClick={() => handleNavigate('lunch_break', 1)}>&gt;</button>
            </div>
            <button className="reset-btn" onClick={() => handleReset('lunch_break')}>Reset to Auto</button>
            <p className="admin-feedback-text">{feedback.lunch_break}</p>
            <CurrentEventDetails event={getCurrentEvent('lunch_break')} />
        </div>
    </div>

 <div className="admin-full-schedule-view">
  <FullEventList title={`${HALL1_NAME} Schedule`} events={vizhinjamEvents} />
  <FullEventList title={`${HALL2_NAME} Schedule`} events={lightHouseEvents} />
  <FullEventList title={`${HALL3_4_NAME} Schedule`} events={bayAndWavesEvents} />
       <FullEventList title={`Lunch/Break Schedule`} events={lunchEvents} />
 </div>
 </div>
);
};

export default LiveDisplayAdmin;