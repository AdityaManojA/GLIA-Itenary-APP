// src/pages/AdminPage.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventForm from '../components/EventForm';
import Scanner from '../components/Scanner';
import AlertsAdmin from '../components/AlertsAdmin';
import ManageEvents from '../components/ManageEvents';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('manageEvents'); // Default to manage events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventToEdit, setEventToEdit] = useState(null); // NEW: State to hold event for editing

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

  // NEW: Function to handle when the edit button is clicked
  const handleEdit = (event) => {
    setEventToEdit(event);
    setActiveTab('addEvent'); // Switch to the form tab
  };

  // NEW: Function to handle when editing is done or cancelled
  const handleDoneEditing = () => {
    setEventToEdit(null);
    setActiveTab('manageEvents'); // Switch back to the list
  };

  return (
    <main className="app-main">
      <div className="tabs-nav">
        {/* UPDATED: Add Event tab now clears the edit state */}
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
          {/* UPDATED: Pass the current event and done handler to the form */}
          {activeTab === 'addEvent' && <EventForm currentEvent={eventToEdit} onDone={handleDoneEditing} />}

          {/* UPDATED: Pass the edit handler to the manage component */}
          {activeTab === 'manageEvents' && <ManageEvents events={events} onEdit={handleEdit} />}
          
          {activeTab === 'scanner' && <Scanner />}
          {activeTab === 'alerts' && <AlertsAdmin />}
        </div>
      )}
    </main>
  );
};

export default AdminPage;