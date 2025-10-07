import React from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ManageAlerts = ({ alerts }) => {

  const handleDelete = async (alertId, alertTitle) => {
    if (window.confirm(`Are you sure you want to delete the alert: "${alertTitle}"?`)) {
      try {
        const alertDocRef = doc(db, 'notifications', alertId);
        await deleteDoc(alertDocRef);
        alert('Alert deleted successfully!');
      } catch (error) {
        console.error("Error deleting alert: ", error);
        alert('Failed to delete alert.');
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No date';
    return timestamp.toDate().toLocaleString();
  };

  return (
    <div className="manage-alerts-container">
      <h2>Manage Sent Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts have been sent yet.</p>
      ) : (
        <ul className="schedule-list">
          {alerts.map(alert => (
            <li key={alert.id} className="schedule-list-item">
              <div className="event-info">
                <p className="alert-title">{alert.title}</p>
                <p className="alert-message" style={{ margin: '0.5rem 0' }}>{alert.message}</p>
                <div className="event-details-list">
                  <span>🕒 Sent: {formatTimestamp(alert.createdAt)}</span>
                </div>
              </div>
              <div className="event-actions">
                <button className="delete-btn" onClick={() => handleDelete(alert.id, alert.title)}>
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

export default ManageAlerts;
