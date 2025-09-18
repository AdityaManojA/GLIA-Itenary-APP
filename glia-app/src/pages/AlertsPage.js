// src/pages/AlertsPage.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc') // No limit, fetches all alerts
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
    // Format to include date and time
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  if (loading) {
    return (
        <div className="card glass-effect">
            <h1 style={{ textAlign: 'center' }}>Notifications</h1>
            <p>Loading alerts...</p>
        </div>
    );
  }

  return (
    <div className="card glass-effect">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>All Notifications</h1>
      {alerts.length === 0 ? (
        <p className="no-alerts-message" style={{ textAlign: 'center' }}>No notifications have been sent yet.</p>
      ) : (
        <ul className="alerts-list">
          {alerts.map(alert => (
            <li key={alert.id} className="alert-item">
              <div className="alert-header">
                <strong>{alert.title}</strong>
                <span className="alert-timestamp">{formatTimestamp(alert.createdAt)}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsPage;