import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventForm from '../components/EventForm';
import AlertsAdmin from '../components/AlertsAdmin';
import ManageEvents from '../components/ManageEvents';
import ManageAlerts from '../components/ManageAlerts';
import LiveDisplayAdmin from '../components/LiveDisplayAdmin';
import ScannedList from '../components/ScannedList';
// 💡 NEW: Import the new component (adjust path if needed)
import SortedLiveScans from '../components/SortedLiveScans'; 


const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('manageEvents'); 
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [alertToEdit, setAlertToEdit] = useState(null);

  useEffect(() => {
    // Fetch events
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

    // Fetch alerts
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
        <button onClick={() => setActiveTab('liveDisplay')} className={activeTab === 'liveDisplay' ? 'tab-active' : ''}>Live Display</button>
        <button onClick={() => setActiveTab('scannedList')} className={activeTab === 'scannedList' ? 'tab-active' : ''}>Scanned List</button>
        {/* 💡 NEW: Sorted Live Scans Tab */}
        <button onClick={() => setActiveTab('sortedLiveScans')} className={activeTab === 'sortedLiveScans' ? 'tab-active' : ''}>Sorted Live Scans</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading Admin Panel...</p></div>
      ) : (
        <div>
          {activeTab === 'addEvent' && <EventForm currentEvent={eventToEdit} onDone={handleDoneEditing} />}
          {activeTab === 'manageEvents' && <ManageEvents events={events} onEdit={handleEdit} />}
          {activeTab === 'sendAlert' && <AlertsAdmin currentAlert={alertToEdit} onDone={handleDoneAlertEditing} />}
          {activeTab === 'manageAlerts' && <ManageAlerts alerts={alerts} onEdit={handleAlertEdit} />}
          {activeTab === 'liveDisplay' && <LiveDisplayAdmin />}
          {activeTab === 'scannedList' && <ScannedList />}
          {/* 💡 NEW: Render the sorted list component */}
          {activeTab === 'sortedLiveScans' && <SortedLiveScans />} 
        </div>
      )}
    </div>
  );
};

export default AdminPage;