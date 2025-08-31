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
      limit(10)
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

  if (loading) {
    return <div className="alerts-list-container glass-effect"><p>Loading alerts...</p></div>;
  }

  return (
    <div className="alerts-list-container glass-effect">
      <h3>Recent Alerts</h3>
      {alerts.length === 0 ? (
        <p className="no-alerts-message">No recent alerts.</p>
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

export default AlertsList;
