import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'), 
      limit(5) //Limiter for how many alers need to be shown
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="alerts-list-container glass-effect">
      <h3>Recent Alerts</h3>
      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="no-alerts-message">No recent alerts.</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsList;