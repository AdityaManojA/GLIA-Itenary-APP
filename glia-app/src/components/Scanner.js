// src/components/Scanner.js

import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// UPDATED: Scanner now accepts participants list as a prop
const Scanner = ({ participants }) => {
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanEvent, setScanEvent] = useState('lunch-2025-10-29');

  // NEW: Functions to play sounds
  const playSound = (url) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Audio playback failed.", e));
  };

  const handleScan = useCallback(async (userId) => {
    setIsProcessing(true);
    setFeedback({ message: 'Processing...', type: 'info' });

    // NEW: Find the participant's name from the prop
    const participant = participants.find(p => p.reg_no === userId);
    const participantName = participant ? participant.name : 'Unknown User';

    if (!userId || !participant) {
      setFeedback({ message: `❌ ERROR: Invalid QR Code.`, type: 'error' });
      playSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      setIsProcessing(false);
      return;
    }

    try {
      const couponDocRef = doc(db, 'users', userId, 'mealCoupons', scanEvent);
      const docSnap = await getDoc(couponDocRef);

      if (!docSnap.exists()) {
        setFeedback({ message: `❌ ERROR: User not found in database.`, type: 'error' });
        playSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      } else if (docSnap.data().status === 'used') {
        const scanTime = docSnap.data().scannedAt.toDate().toLocaleTimeString();
        setFeedback({ message: `⚠️ ALREADY SCANNED for ${participantName} at ${scanTime}`, type: 'warning' });
        playSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      } else {
        await updateDoc(couponDocRef, {
          status: 'used',
          scannedAt: serverTimestamp()
        });
        // UPDATED: Show participant's name in success message
        setFeedback({ message: `✅ SUCCESS: Scanned for ${participantName}`, type: 'success' });
        playSound('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
      }
    } catch (error) {
      console.error("Error processing scan: ", error);
      setFeedback({ message: '❌ ERROR: Could not process scan.', type: 'error' });
      playSound('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
    }

    setTimeout(() => {
      setFeedback({ message: '', type: '' });
      setIsProcessing(false);
    }, 3000); // Increased timeout to 3 seconds
  }, [scanEvent, participants]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
    
    const onScanSuccess = (decodedText) => {
      if (!isProcessing) {
        handleScan(decodedText);
      }
    };
    
    scanner.render(onScanSuccess, () => {});
    
    return () => { scanner.clear().catch(console.error); };
  }, [isProcessing, handleScan]);

  const handleEventChange = (e) => {
    setScanEvent(e.target.value);
    setFeedback({ message: `Scanning for ${e.target.options[e.target.selectedIndex].text}`, type: 'info' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
  };
  
  // Custom styles for feedback messages
  const getFeedbackStyle = (type) => {
    switch (type) {
      case 'success':
        return { backgroundColor: 'var(--primary-color)', color: 'var(--bg-color)' };
      case 'error':
        return { backgroundColor: '#E57373', color: 'var(--text-primary)' };
      case 'warning':
        return { backgroundColor: '#FFB74D', color: 'var(--bg-color)' };
      default:
        return { backgroundColor: 'var(--surface-color)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="card glass-effect" style={{ textAlign: 'center' }}>
      <h2>Food Coupon Scanner</h2>
      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="scan-event-select" style={{ marginRight: '1rem' }}>Select Event:</label>
        <select id="scan-event-select" value={scanEvent} onChange={handleEventChange} style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--primary-color)' }}>
          <option value="lunch-2025-10-29">Lunch - Oct 29</option>
          <option value="dinner-2025-10-29">Dinner - Oct 29</option>
          <option value="lunch-2025-10-30">Lunch - Oct 30</option>
          <option value="dinner-2025-10-30">Dinner - Oct 30</option>
          <option value="lunch-2025-10-31">Lunch - Oct 31</option>
          <option value="dinner-2025-10-31">Dinner - Oct 31</option>
          <option value="lunch-2025-11-01">Lunch - Nov 1</option>
        </select>
      </div>
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '1.5rem auto', borderRadius: '15px', overflow: 'hidden', border: '2px solid var(--surface-color)' }}></div>
      {feedback.message && (
        <div className="feedback-message" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', fontWeight: 'bold', transition: 'all 0.3s ease', ...getFeedbackStyle(feedback.type) }}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default Scanner;