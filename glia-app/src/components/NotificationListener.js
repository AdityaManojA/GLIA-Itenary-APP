import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const NotificationListener = () => {
  const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState(null);

  useEffect(() => {
    // 1. Check for notification support and ask for permission on load
    if (!('Notification' in window)) {
      console.log("This browser does not support desktop notification");
    } else {
      Notification.requestPermission();
    }

    // 2. Set up the Firestore listener
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newNotification = change.doc.data();
          const notificationTimestamp = newNotification.createdAt?.toMillis();

          // Only show notification if it's new
          if (notificationTimestamp && notificationTimestamp !== lastNotificationTimestamp) {
            setLastNotificationTimestamp(notificationTimestamp);
            showNotification(newNotification);
          }
        }
      });
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [lastNotificationTimestamp]);

  const showNotification = (notification) => {
    if (Notification.permission === 'granted') {
      const { title, message } = notification;
      
      // Create the browser notification
      new Notification(title, {
        body: message,
        // You can add an icon here
        // icon: '/ian-logo.png' 
      });

      // Play a sound
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/notification_high_intensity.ogg');
      
      // The play() method returns a Promise. We use this to catch potential errors.
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // This error is expected if the user hasn't interacted with the page yet.
          // We can log it for debugging but don't need to show it to the user.
          console.log("Audio playback was prevented by the browser. User interaction is required.");
        });
      }
    }
  };


  return null;
};

export default NotificationListener;

