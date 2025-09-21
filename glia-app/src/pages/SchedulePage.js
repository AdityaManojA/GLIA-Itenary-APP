

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config'; 
import FullSchedule from '../components/FullSchedule'; 

const SchedulePage = () => {

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
        <button onClick={() => setActiveTab('schedule')} className={activeTab === 'schedule' ? 'tab-active' : ''}>Full Schedule</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading schedule...</p></div>
      ) : (
        <div>
          {activeTab === 'schedule' && <FullSchedule events={events} />}
        </div>
      )}
    </main>
  );
};

export default SchedulePage;