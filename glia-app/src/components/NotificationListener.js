import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const NotificationListener = () => {
  const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState(null);
  // NEW: State to track notification permission
  const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');

  useEffect(() => {
    // This function will now handle asking for permission
    const setupNotifications = async () => {
      if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
      }

      // If permission is already granted, we don't need to ask again
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
        return;
      }
      
      // Ask for permission and wait for the user's response
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
      }
    };

    setupNotifications();
  }, []);

  // This second useEffect will ONLY run after permission has been granted
  useEffect(() => {
    // If permission isn't granted, don't set up the listener
    if (!permissionGranted) return;

    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newNotification = change.doc.data();
          const notificationTimestamp = newNotification.createdAt?.toMillis();

          if (notificationTimestamp && notificationTimestamp !== lastNotificationTimestamp) {
            setLastNotificationTimestamp(notificationTimestamp);
            showNotification(newNotification);
          }
        }
      });
    });

    console.log("Notification listener attached.");
    return () => unsubscribe(); 
  }, [permissionGranted, lastNotificationTimestamp]); // It now depends on the permission status

  const showNotification = (notification) => {
    if (permissionGranted) {
      const { title, message } = notification;
      
      new Notification(title, {
        body: message,
        icon: '/v1.jpg' // Using your background image as an icon example
      });

      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/notification_high_intensity.ogg');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio playback was prevented by the browser.");
        });
      }
    }
  };

  return null;
};

export default NotificationListener;

