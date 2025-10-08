import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Scanner = ({ participants }) => {
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanEvent, setScanEvent] = useState('LUNCH-OCT-29'); // Default meal event

  const playSound = (type) => {
    const successSound = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
    const errorSound = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';
    const audio = new Audio(type === 'success' ? successSound : errorSound);
    audio.play().catch(e => console.error("Audio playback failed.", e));
  };

  const handleScan = useCallback(async (scannedId) => {
    setIsProcessing(true);
    setFeedback({ message: 'Processing...', type: 'info' });

    const participant = participants.find(p => p.reg_no.toLowerCase() === scannedId.toLowerCase());

    if (!participant) {
      setFeedback({ message: `❌ ERROR: Attendee ID not found.`, type: 'error' });
      playSound('error');
      setTimeout(() => setIsProcessing(false), 2500);
      return;
    }
    
    const participantName = participant.name;
    const couponDocRef = doc(db, 'users', participant.reg_no, 'mealCoupons', scanEvent);

    try {
      const docSnap = await getDoc(couponDocRef);

      if (!docSnap.exists()) {
        // If coupon doesn't exist, create it and mark as used
        await setDoc(couponDocRef, {
          status: 'used',
          scannedAt: serverTimestamp()
        });
        setFeedback({ message: `✅ SUCCESS: First scan for ${participantName}`, type: 'success' });
        playSound('success');
      } else if (docSnap.data().status === 'used') {
        const scanTime = docSnap.data().scannedAt.toDate().toLocaleTimeString();
        setFeedback({ message: `⚠️ ALREADY SCANNED for ${participantName} at ${scanTime}`, type: 'warning' });
        playSound('error');
      } else {
        // This case handles if a coupon exists but wasn't used, though our logic doesn't create this state.
        await updateDoc(couponDocRef, {
          status: 'used',
          scannedAt: serverTimestamp()
        });
        setFeedback({ message: `✅ SUCCESS: Scanned for ${participantName}`, type: 'success' });
        playSound('success');
      }
    } catch (error) {
      console.error("Error processing scan: ", error);
      setFeedback({ message: '❌ ERROR: Database operation failed.', type: 'error' });
      playSound('error');
    }

    setTimeout(() => {
      setFeedback({ message: '', type: '' });
      setIsProcessing(false);
    }, 3000);
  }, [scanEvent, participants]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 10 }, false);
    
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
  };
  
  const getFeedbackStyle = (type) => {
    switch (type) {
      case 'success': return { backgroundColor: '#4CAF50', color: 'white' };
      case 'error': return { backgroundColor: 'var(--primary-color)', color: 'white' };
      case 'warning': return { backgroundColor: '#FFC107', color: 'var(--text-primary)' };
      default: return { backgroundColor: '#f0f0f0', color: 'var(--text-primary)' };
    }
  };

  return (
    <div>
      <h2>Meal Coupon Scanner</h2>
      <div className="input-group">
        <label htmlFor="scan-event-select">Select Meal Event:</label>
        <select id="scan-event-select" value={scanEvent} onChange={handleEventChange}>
          <option value="LUNCH-OCT-29">Lunch - Oct 29</option>
          <option value="DINNER-OCT-29">Dinner - Oct 29</option>
          <option value="LUNCH-OCT-30">Lunch - Oct 30</option>
          <option value="DINNER-OCT-30">Dinner - Oct 30</option>
          <option value="LUNCH-OCT-31">Lunch - Oct 31</option>
          <option value="DINNER-OCT-31">Dinner - Oct 31</option>
          <option value="LUNCH-NOV-01">Lunch - Nov 1</option>
        </select>
      </div>
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '1.5rem auto', borderRadius: '8px', overflow: 'hidden', border: '2px solid #E0E0E0' }}></div>
      {feedback.message && (
        <div className="feedback-message" style={{ ...getFeedbackStyle(feedback.type) }}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default Scanner;
