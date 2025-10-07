import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import AlertsList from '../components/AlertsList';
import HappeningNow from '../components/HappeningNow';

const HomePage = ({ user }) => {
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
    const firstName = fullName.split(' ')[0];
    if (!firstName) return 'Attendee';
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

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

  return (
    <div className="home-page-layout">
      <div className="welcome-header">
        <h1>Welcome, {getFirstName(user?.name)}</h1>
        <p>Here's what's happening at IAN 2025.</p>
      </div>

      {/* This component handles the two-column live display */}
      <HappeningNow 
        itinerary={itinerary}
        toggleItinerary={toggleItinerary}
      />

      <AlertsList />
    </div>
  );
};

export default HomePage;

