import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
// Changed: Corrected the component imports to be semantically accurate
import EventForm from '../components/EventForm'; 
import FullSchedule from '../components/FullSchedule'; 
import Scanner from '../components/Scanner';

const AdminPage = () => {
  // Changed: Updated initial tab state to be more descriptive
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
        {/* Changed: Updated tab names and state values for clarity */}
        <button onClick={() => setActiveTab('addEvent')} className={activeTab === 'addEvent' ? 'tab-active' : ''}>Add Event</button>
        <button onClick={() => setActiveTab('viewSchedule')} className={activeTab === 'viewSchedule' ? 'tab-active' : ''}>View Schedule</button>
        {/* Changed (Bug Fix): Corrected the className condition for the Scanner tab */}
        <button onClick={() => setActiveTab('scanner')} className={activeTab === 'scanner' ? 'tab-active' : ''}>Scanner</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading Admin Panel...</p></div>
      ) : (
        <div>
          {/* Changed: Render the correct components for each tab */}
          {activeTab === 'addEvent' && <EventForm />}
          {activeTab === 'viewSchedule' && <FullSchedule events={events} />}
          {activeTab === 'scanner' && <Scanner events={events} />}
        </div>
      )}
    </main>
  );
};

export default AdminPage;