import React from 'react';

const FullSchedule = ({ events }) => {

  // Function to determine the CSS class based on the venue
  const getVenueClass = (venue) => {
    if (!venue) return '';
    const lowerCaseVenue = venue.toLowerCase();

    if (lowerCaseVenue.includes('hall 1') || lowerCaseVenue.includes('vizhinjam')) {
      return 'venue-hall1';
    } else if (lowerCaseVenue.includes('hall 2') || lowerCaseVenue.includes('light house')) {
      return 'venue-hall2';
    } else if (lowerCaseVenue.includes('halls 3 & 4') || lowerCaseVenue.includes('bay & waves')) {
      return 'venue-hall3-hall4'; 
    } else if (lowerCaseVenue.includes('hall 3')) {
      return 'venue-hall3';
    } else if (lowerCaseVenue.includes('hall 4')) {
      return 'venue-hall4';
    } else if (lowerCaseVenue.includes('lunch') || lowerCaseVenue.includes('break')) {
      return 'venue-lunch';
    }
    return ''; // Default/no special class
  };


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
    const venueClass = getVenueClass(event.venue);
    // Determine if it's a lunch or break event (case-insensitive check on title or venue)
    const isLunchOrBreak = event.title.toLowerCase().includes('lunch') || 
                          event.title.toLowerCase().includes('break') ||
                          (event.venue && event.venue.toLowerCase().includes('lunch')) || 
                          (event.venue && event.venue.toLowerCase().includes('break'));


   return (
    <li key={event.id} className={`schedule-list-item ${venueClass}`}>
    
    {/* Hide speaker photo/placeholder if it's a lunch/break event */}
    {(!isLunchOrBreak && event.speakerName) ? (
        event.speakerImageURL ? (
            <img src={event.speakerImageURL} alt={event.speakerName} className="speaker-image-small" />
        ) : (
            <div className="speaker-image-placeholder">
            <span>👤</span>
            </div>
        )
    ) : null}
    
    <div className="event-info">
     <p className="event-title-list">{event.title}</p>


     {!isLunchOrBreak && event.speakerName && (
        <p className="speaker-name-list">{event.speakerName}</p>
     )}

     {!isLunchOrBreak && event.speakerTopic && (
        <p className="speaker-topic-list">{event.speakerTopic}</p>
     )}
     
     <div className="event-details-list">
  
     {(!isLunchOrBreak && event.venue) && <span>📍 {event.venue}</span>}

     <span>🕒 {event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
     </div>
    </div>
    

    <div className="event-right-column">

     {!isLunchOrBreak && event.chairpersons && (
     <div className="chairpersons-info">
      <strong>Chairperson(s):</strong>
      <p>{event.chairpersons}</p>
     </div>
     )}

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