import React from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ManageAlerts = ({ alerts, onEdit }) => {

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
    return timestamp.toDate().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="manage-alerts-container">
      <h2>Manage Sent Alerts</h2>
      {alerts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No alerts have been sent yet.</p>
      ) : (
        <ul className="alerts-list">
          {alerts.map(alert => (
            <li key={alert.id} className="alert-item-redesigned">
              <div className="alert-icon">
                <span>🔔</span>
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <strong className="alert-title">{alert.title}</strong>
                  <span className="alert-timestamp">{formatTimestamp(alert.createdAt)}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
              <div className="event-actions">
                <button className="edit-btn" onClick={() => onEdit(alert)}>
                  Edit
                </button>
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

