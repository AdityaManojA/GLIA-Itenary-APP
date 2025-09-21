import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventForm from '../components/EventForm';
import Scanner from '../components/Scanner';
import AlertsAdmin from '../components/AlertsAdmin';
import ManageEvents from '../components/ManageEvents';
import participants from '../data/participants.json'; // Import participants data

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('scanner'); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToEdit, setEventToEdit] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'schedule'), orderBy('startTime'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    return () => unsubscribe();
  }, []);

  const handleEdit = (event) => {
    setEventToEdit(event);
    setActiveTab('addEvent');
  };

  const handleDoneEditing = () => {
    setEventToEdit(null);
    setActiveTab('manageEvents');
  };

  return (
    <main className="app-main">
      <div className="tabs-nav">
        <button onClick={() => { setEventToEdit(null); setActiveTab('addEvent'); }} className={activeTab === 'addEvent' ? 'tab-active' : ''}>
          {eventToEdit ? 'Edit Event' : 'Add Event'}
        </button>
        <button onClick={() => setActiveTab('manageEvents')} className={activeTab === 'manageEvents' ? 'tab-active' : ''}>Manage Events</button>
        <button onClick={() => setActiveTab('scanner')} className={activeTab === 'scanner' ? 'tab-active' : ''}>Scanner</button>
        <button onClick={() => setActiveTab('alerts')} className={activeTab === 'alerts' ? 'tab-active' : ''}>Alerts</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading Admin Panel...</p></div>
      ) : (
        <div>
          {activeTab === 'addEvent' && <EventForm currentEvent={eventToEdit} onDone={handleDoneEditing} />}
          {activeTab === 'manageEvents' && <ManageEvents events={events} onEdit={handleEdit} />}
          
          
          {activeTab === 'scanner' && <Scanner participants={participants} />}
          
          {activeTab === 'alerts' && <AlertsAdmin />}
        </div>
      )}
    </main>
  );
};

export default AdminPage;