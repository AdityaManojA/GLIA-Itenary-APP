import React from 'react';

const FullSchedule = ({ events }) => {

  // New function to determine the CSS class based on the venue
  const getVenueClass = (venue) => {
    if (!venue) return '';
    const lowerCaseVenue = venue.toLowerCase();

    if (lowerCaseVenue.includes('hall 1') || lowerCaseVenue.includes('vizhinjam')) {
      return 'venue-hall1';
    } else if (lowerCaseVenue.includes('hall 2') || lowerCaseVenue.includes('light house')) {
      return 'venue-hall2';
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
    // Apply the venue class to the schedule list item
    const venueClass = getVenueClass(event.venue);
   return (
    // Updated line to include the dynamic class
    <li key={event.id} className={`schedule-list-item ${venueClass}`}>
    
    {/* Hide speaker info for non-session events like Lunch */}
    {event.venue && event.venue.toUpperCase() !== 'LUNCH' ? (
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

     {/* Only show speaker if it's not a lunch/break event */}
     {event.venue && event.venue.toUpperCase() !== 'LUNCH' && event.speakerName && (
        <p className="speaker-name-list">{event.speakerName}</p>
     )}

     {event.venue && event.venue.toUpperCase() !== 'LUNCH' && event.speakerTopic && (
        <p className="speaker-topic-list">{event.speakerTopic}</p>
     )}
     
     <div className="event-details-list">
     <span>📍 {event.venue}</span>
     <span>🕒 {event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
     </div>
    </div>
    

    <div className="event-right-column">
     {/* Only show chairpersons if it's not a lunch/break event */}
     {event.venue && event.venue.toUpperCase() !== 'LUNCH' && event.chairpersons && (
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