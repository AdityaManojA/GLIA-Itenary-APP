import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// We can reuse the FullSchedule component to display the events
import FullSchedule from '../components/FullSchedule';

const ItineraryPage = () => {
  const [itineraryEvents, setItineraryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen for changes to the user's personal itinerary
    const itineraryColRef = collection(db, 'users', user.uid, 'itinerary');
    const unsubscribe = onSnapshot(itineraryColRef, async (snapshot) => {
      const eventPromises = snapshot.docs.map(eventDoc => {
        const eventId = eventDoc.id;
        const eventRef = doc(db, 'schedule', eventId);
        return getDoc(eventRef);
      });

      const eventDocs = await Promise.all(eventPromises);
      
      const eventsData = eventDocs
        .filter(doc => doc.exists())
        .map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime.toDate(),
            endTime: doc.data().endTime.toDate(),
        }));

      // Sort events by start time
      eventsData.sort((a, b) => a.startTime - b.startTime);

      setItineraryEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="card glass-effect"><p>Loading your itinerary...</p></div>;
  }

  return (
    <div className="card glass-effect">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>My Itinerary</h1>
      {itineraryEvents.length > 0 ? (
        <FullSchedule events={itineraryEvents} />
      ) : (
        <p style={{ textAlign: 'center' }}>You haven't added any events to your itinerary yet. Go to the full schedule to select events.</p>
      )}
    </div>
  );
};

export default ItineraryPage;
