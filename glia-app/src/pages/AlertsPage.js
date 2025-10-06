import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  return (
    <div className="card glass-effect">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>All Notifications</h1>
      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="no-alerts-message" style={{ textAlign: 'center' }}>No notifications have been sent yet.</p>
      ) : (
        // UPDATED JSX structure below to match the new design
        <ul className="alerts-list">
          {alerts.map(alert => (
            <li key={alert.id} className="alert-item-redesigned">
              <div className="alert-icon">
                <span>-🔔- </span>
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <strong className="alert-title">{alert.title}</strong>
                  <span className="alert-timestamp">{formatTimestamp(alert.createdAt)}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsPage;