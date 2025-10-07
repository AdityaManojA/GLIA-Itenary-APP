import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventForm from '../components/EventForm';
import AlertsAdmin from '../components/AlertsAdmin';
import ManageEvents from '../components/ManageEvents';
import ManageAlerts from '../components/ManageAlerts';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('manageEvents'); 
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [alertToEdit, setAlertToEdit] = useState(null);

  useEffect(() => {
    const eventsQuery = query(collection(db, 'schedule'), orderBy('startTime'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      }));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching schedule: ", error);
      setLoading(false);
    });

    const alertsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(alertsData);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeAlerts();
    };
  }, []);

  const handleEdit = (event) => {
    setEventToEdit(event);
    setActiveTab('addEvent');
  };

  const handleDoneEditing = () => {
    setEventToEdit(null);
    setActiveTab('manageEvents');
  };

  const handleAlertEdit = (alert) => {
    setAlertToEdit(alert);
    setActiveTab('sendAlert');
  };

  const handleDoneAlertEditing = () => {
    setAlertToEdit(null);
    setActiveTab('manageAlerts');
  };

  return (
    <div className="card glass-effect">
      <div className="tabs-nav">
        <button onClick={() => { setEventToEdit(null); setActiveTab('addEvent'); }} className={activeTab === 'addEvent' ? 'tab-active' : ''}>
          {eventToEdit ? 'Edit Event' : 'Add Event'}
        </button>
        <button onClick={() => setActiveTab('manageEvents')} className={activeTab === 'manageEvents' ? 'tab-active' : ''}>Manage Events</button>
        <button onClick={() => { setAlertToEdit(null); setActiveTab('sendAlert'); }} className={activeTab === 'sendAlert' ? 'tab-active' : ''}>
          {alertToEdit ? 'Edit Alert' : 'Send Alert'}
        </button>
        <button onClick={() => setActiveTab('manageAlerts')} className={activeTab === 'manageAlerts' ? 'tab-active' : ''}>Manage Alerts</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading Admin Panel...</p></div>
      ) : (
        <div>
          {activeTab === 'addEvent' && <EventForm currentEvent={eventToEdit} onDone={handleDoneEditing} />}
          {activeTab === 'manageEvents' && <ManageEvents events={events} onEdit={handleEdit} />}
          {activeTab === 'sendAlert' && <AlertsAdmin currentAlert={alertToEdit} onDone={handleDoneAlertEditing} />}
          
          {activeTab === 'manageAlerts' && <ManageAlerts alerts={alerts} onEdit={handleAlertEdit} />}
        </div>
      )}
    </div>
  );
};

export default AdminPage;

