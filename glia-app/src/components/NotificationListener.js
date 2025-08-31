import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const NotificationListener = () => {
  const [lastNotificationTimestamp, setLastNotificationTimestamp] = useState(null);
  // State to track the permission status: 'default', 'granted', or 'denied'
  const [permission, setPermission] = useState(Notification.permission);

  // This effect sets up the Firestore listener ONLY if permission has been granted
  useEffect(() => {
    if (permission !== 'granted') return;

    console.log("Permission granted. Attaching Firestore listener for notifications.");

    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newNotification = change.doc.data();
          const notificationTimestamp = newNotification.createdAt?.toMillis();

          // Ensure we don't show the same notification twice on a reload
          if (notificationTimestamp && notificationTimestamp !== lastNotificationTimestamp) {
            setLastNotificationTimestamp(notificationTimestamp);
            showNotification(newNotification);
          }
        }
      });
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [permission, lastNotificationTimestamp]); // Re-run if permission changes

  const showNotification = (notification) => {
    const { title, message } = notification;
    
    new Notification(title, {
      body: message,
      icon: '/v1.jpg' // Example icon
    });

    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/notification_high_intensity.ogg');
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio playback was prevented by the browser. User interaction is required first.");
      });
    }
  };

  // This function is called when the user clicks the "Enable" button
  const handleEnableNotifications = async () => {
    const userPermission = await Notification.requestPermission();
    // Update the state with the user's choice
    setPermission(userPermission);
  };

  // If permission is 'default', show the opt-in banner.
  // If 'granted' or 'denied', the component renders nothing.
  if (permission === 'default') {
    return (
      <div className="notification-banner">
        <p>Get live updates and alerts from the conference.</p>
        <button onClick={handleEnableNotifications}>Enable Notifications</button>
      </div>
    );
  }

  // This component doesn't render anything visible in the main app flow
  return null;
};

export default NotificationListener;
