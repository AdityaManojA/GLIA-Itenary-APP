import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import FullSchedule from '../components/FullSchedule';

const SchedulePage = () => {
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);

const PDF_DOWNLOAD_URL = './IAN2025schedule.pdf' 

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

<div className="card glass-effect schedule-page-card-container"> 
    
  <div className="schedule-header-wrapper">
   <h1 style={{ textAlign: 'center' }}>Conference Schedule</h1>
      
      <a 
          href={PDF_DOWNLOAD_URL}
          download
          className="download-pdf-button"
          aria-label="Download Full Schedule as PDF"
      >
          <span className="download-icon">↓</span> Download PDF
      </a>
  </div>

  {loading ? (
   <div style={{ textAlign: 'center' }}><p>Loading schedule...</p></div>
  ) : (
   <FullSchedule events={events} />
  )}
</div>
);
};

export default SchedulePage;