import React from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';


const ManageEvents = ({ events, onEdit }) => {

  const handleDelete = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete the event: "${eventTitle}"?`)) {
      try {
        const eventDocRef = doc(db, 'schedule', eventId);
        await deleteDoc(eventDocRef);
        alert('Event deleted successfully!');
      } catch (error) {
        console.error("Error deleting event: ", error);
        alert('Failed to delete event.');
      }
    }
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="manage-events-container">
      <h2>Manage Conference Events</h2>
      {events.length === 0 ? (
        <p>No events have been added yet.</p>
      ) : (
        <ul className="schedule-list">
          {events.map(event => (
            <li key={event.id} className="schedule-list-item">
              <div className="event-info">
                <p className="event-title-list">{event.title}</p>
                <div className="event-details-list">
                  <span>📍 {event.venue}</span>
                  <span>🕒 {formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                </div>
              </div>
              <div className="event-actions">
                
                <button className="edit-btn" onClick={() => onEdit(event)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(event.id, event.title)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageEvents;