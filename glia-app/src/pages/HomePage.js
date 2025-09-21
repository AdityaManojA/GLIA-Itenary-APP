

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db} from '../firebase/config';
import AlertsList from '../components/AlertsList';

const HomePage = ({ user }) => {
  const [liveEvents, setLiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState(new Set());


  useEffect(() => {
    if (!user) return;
    const itineraryColRef = collection(db, 'users', user.uid, 'itinerary');
    const unsubscribe = onSnapshot(itineraryColRef, (snapshot) => {
      const savedEventIds = new Set(snapshot.docs.map(doc => doc.id));
      setItinerary(savedEventIds);
    });
    return () => unsubscribe();
  }, [user]);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Attendee';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const now = new Date();
    
    const liveQuery = query(
      collection(db, 'schedule'),
      where('startTime', '<=', now),
      orderBy('startTime', 'desc')
    );

    const upcomingQuery = query(
        collection(db, 'schedule'),
        where('startTime', '>', now),
        orderBy('startTime', 'asc'),
        limit(3)
    );

    const unsubscribeLive = onSnapshot(liveQuery, (snapshot) => {
      const allStartedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), startTime: doc.data().startTime.toDate(), endTime: doc.data().endTime.toDate() }));
      const currentLiveEvents = allStartedEvents.filter(event => event.endTime > now);
      setLiveEvents(currentLiveEvents);
      setLoading(false);
    });

    const unsubscribeUpcoming = onSnapshot(upcomingQuery, (snapshot) => {
        const upcomingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), startTime: doc.data().startTime.toDate(), endTime: doc.data().endTime.toDate() }));
        setUpcomingEvents(upcomingData);
    });

    return () => {
        unsubscribeLive();
        unsubscribeUpcoming();
    };
  }, []);

 
  const toggleItinerary = async (eventId, isSaved) => {
    if (!user) {
      alert("Please log in to create a personalized itinerary.");
      return;
    }
    const itineraryDocRef = doc(db, 'users', user.uid, 'itinerary', eventId);
    if (isSaved) {
      await deleteDoc(itineraryDocRef);
    } else {
      await setDoc(itineraryDocRef, { savedAt: new Date() });
    }
  };


  const renderEventCard = (event, isLive = false) => {
    const isSaved = itinerary.has(event.id);
    return (
        <div key={event.id} className={`event-card ${isLive ? 'live' : ''} schedule-list-item`}>
            {event.speakerImageURL && <img src={event.speakerImageURL} alt={event.speakerName} className="speaker-image-large" />}
            <div className="event-info">
                <h3 className="event-title">{event.title}</h3>
                {event.speakerName && <p className="speaker-name">{event.speakerName}</p>}
                {event.designation && <p className="speaker-designation">{event.designation}</p>}
                <div className="event-details">
                    <span>📍 {event.venue}</span>
                    <span>🕒 {event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
            
            <button 
  onClick={() => toggleItinerary(event.id, isSaved)}
  title={isSaved ? "Remove from Itinerary" : "Add to Itinerary"}
  className={`itinerary-toggle-button ${isSaved ? 'saved' : ''}`}
>
  
</button>
        </div>
    );
  }

  return (
    <div className="home-page-layout">
      <div className="welcome-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Welcome, {getFirstName(user?.name)}</h1>
        <p>Here's what's happening at IAN 2025.</p>
      </div>

      <div className="card glass-effect">
        <h2>Happening Now</h2>
        {loading ? (
          <p>Checking schedule...</p>
        ) : liveEvents.length > 0 ? (
          liveEvents.map(event => renderEventCard(event, true))
        ) : (
          <p>No event is currently in session. See what's up next!</p>
        )}
      </div>

      <div className="card glass-effect">
          <h2>Up Next</h2>
          {loading ? (
              <p>Loading upcoming events...</p>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map(event => renderEventCard(event, false))
          ) : (
              <p>No upcoming events scheduled at the moment.</p>
          )}
      </div>

      <AlertsList />
    </div>
  );
};

export default HomePage;