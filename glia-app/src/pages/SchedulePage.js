import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import FullSchedule from '../components/FullSchedule';

const SchedulePage = () => {
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
      const filteredEvents = eventsData.filter(event => 
          event.venue?.toUpperCase() !== 'LUNCH'
      );
      
   setEvents(filteredEvents);
   setLoading(false);
  }, (error) => {
   console.error("Error fetching schedule: ", error);
   setLoading(false);
  });
  return () => unsubscribe();
 }, []);

 return (
  <div className="card glass-effect">
   <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Conference Schedule</h1>
   {loading ? (
    <div style={{ textAlign: 'center' }}><p>Loading schedule...</p></div>
   ) : (
    <FullSchedule events={events} />
   )}
  </div>
 );
};

export default SchedulePage;