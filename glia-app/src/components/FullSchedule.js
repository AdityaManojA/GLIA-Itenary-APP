import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const FullSchedule = ({ events }) => {
 // Removed: [itinerary, setItinerary] state and its useEffect logic
 // Removed: const user = auth.currentUser;
 
 // Removed: toggleItinerary function
 // Removed: useEffect hook for itinerary

 const groupedEvents = events.reduce((acc, event) => {
  const eventDate = event.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (!acc[eventDate]) acc[eventDate] = [];
  acc[eventDate].push(event);
  return acc;
 }, {});

 if (events.length === 0) {
  return <p className="text-center text-muted">No events scheduled yet.</p>;
 }

 return (
  <div className="schedule-container">
   {Object.entries(groupedEvents).map(([date, dateEvents]) => (
    <div key={date}>
     <h3 className="schedule-date-header">{date}</h3>
     <ul className="schedule-list">
      {dateEvents.map(event => {
       // Removed: const isSaved = itinerary.has(event.id);
       return (
        <li key={event.id} className="schedule-list-item">
         {event.speakerImageURL ? (
          <img src={event.speakerImageURL} alt={event.speakerName} className="speaker-image-small" />
         ) : (
          <div className="speaker-image-placeholder">
           <span>👤</span>
          </div>
         )}
         <div className="event-info">
          <p className="event-title-list">{event.title}</p>
          {/* Display Speaker + Institution */}
          {event.speakerName && <p className="speaker-name-list">{event.speakerName}</p>}
          {/* Display Speaker Topic */}
          {event.speakerTopic && <p className="speaker-topic-list">{event.speakerTopic}</p>}
          <div className="event-details-list">
           <span>📍 {event.venue}</span>
           <span>🕒 {event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
         </div>
         
         {/* The right column now only contains chairpersons */}
         <div className="event-right-column">
          {event.chairpersons && (
           <div className="chairpersons-info">
            <strong>Chairperson(s):</strong>
            <p>{event.chairpersons}</p>
           </div>
          )}
          {/* Removed: <button onClick={...} className="itinerary-toggle-button"> */}
         </div>
        </li>
       );
      })}
     </ul>
    </div>
   ))}
  </div>
 );
};

export default FullSchedule;