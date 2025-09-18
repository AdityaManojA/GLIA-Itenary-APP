// src/pages/AdminPage.js

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import EventForm from '../components/EventForm';
import Scanner from '../components/Scanner';
import AlertsAdmin from '../components/AlertsAdmin';
import ManageEvents from '../components/ManageEvents'; // Import the new component

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('addEvent');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="app-main">
      <div className="tabs-nav">
        <button onClick={() => setActiveTab('addEvent')} className={activeTab === 'addEvent' ? 'tab-active' : ''}>Add Event</button>
        {/* The "View Schedule" tab is now "Manage Events" */}
        <button onClick={() => setActiveTab('manageEvents')} className={activeTab === 'manageEvents' ? 'tab-active' : ''}>Manage Events</button>
        <button onClick={() => setActiveTab('scanner')} className={activeTab === 'scanner' ? 'tab-active' : ''}>Scanner</button>
        <button onClick={() => setActiveTab('alerts')} className={activeTab === 'alerts' ? 'tab-active' : ''}>Alerts</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading Admin Panel...</p></div>
      ) : (
        <div>
          {activeTab === 'addEvent' && <EventForm />}
          {/* Render the new ManageEvents component */}
          {activeTab === 'manageEvents' && <ManageEvents events={events} />}
          {activeTab === 'scanner' && <Scanner />}
          {activeTab === 'alerts' && <AlertsAdmin />}
        </div>
      )}
    </main>
  );
};

export default AdminPage;