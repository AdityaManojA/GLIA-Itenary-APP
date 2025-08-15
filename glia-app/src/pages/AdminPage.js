

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config'; 
import HappeningNow from '../components/LoginForm'; 
import FullSchedule from '../components/EventForm'; 

const AdminPage = () => {

  const [activeTab, setActiveTab] = useState('home');
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
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'tab-active' : ''}>Admin only</button>
        <button onClick={() => setActiveTab('schedule')} className={activeTab === 'schedule' ? 'tab-active' : ''}>admine</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Admin panel only</p></div>
      ) : (
        <div>
          {activeTab === 'home' && <HappeningNow events={events} />}
          {activeTab === 'schedule' && <FullSchedule events={events} />}
        </div>
      )}
    </main>
  );
};

export default AdminPage;