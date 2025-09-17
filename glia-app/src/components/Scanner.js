import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const Scanner = () => {
  // We don't need to store the scan result in state, so the unused variable is removed.
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanEvent, setScanEvent] = useState('lunch-2025-10-29');

  // FIX 1: The 'handleScan' function is wrapped in useCallback.
  // This tells React to only recreate the function if its dependencies change.
  // It's a performance optimization and necessary to fix the dependency warning correctly.
  const handleScan = useCallback(async (userId) => {
    setIsProcessing(true);
    setFeedback({ message: 'Processing...', type: 'info' });

    if (!userId) {
      setFeedback({ message: 'Invalid QR Code.', type: 'error' });
      setIsProcessing(false);
      return;
    }

    try {
      const couponDocRef = doc(db, 'users', userId, 'mealCoupons', scanEvent);
      const docSnap = await getDoc(couponDocRef);

      if (!docSnap.exists()) {
        setFeedback({ message: `ERROR: User not found or invalid QR code.`, type: 'error' });
      } else if (docSnap.data().status === 'used') {
        const scanTime = docSnap.data().scannedAt.toDate().toLocaleTimeString();
        setFeedback({ message: `ALREADY SCANNED at ${scanTime}`, type: 'error' });
      } else {
        await updateDoc(couponDocRef, {
          status: 'used',
          scannedAt: serverTimestamp()
        });
        setFeedback({ message: `SUCCESS: ${userId}`, type: 'success' });
      }
    } catch (error) {
      console.error("Error processing scan: ", error);
      setFeedback({ message: 'Error processing scan.', type: 'error' });
    }

    setTimeout(() => {
      setFeedback({ message: '', type: '' });
      setIsProcessing(false);
    }, 2000);
  }, [scanEvent]); // The function now depends on the current scanEvent

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
    
    const onScanSuccess = (decodedText) => {
      if (!isProcessing) {
        // The call to setScanResult is removed as the state variable was unused.
        handleScan(decodedText);
      }
    };
    
    scanner.render(onScanSuccess, () => {});
    
    return () => { scanner.clear().catch(console.error); };
    
  // FIX 2: 'handleScan' is now correctly included in the dependency array.
  }, [isProcessing, handleScan]);

  const handleEventChange = (e) => {
    setScanEvent(e.target.value);
    setFeedback({ message: `Scanning for ${e.target.options[e.target.selectedIndex].text}`, type: 'info' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
  };

  return (
    <div className="card glass-effect" style={{ textAlign: 'center' }}>
      <h2>Food Coupon Scanner</h2>
      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="scan-event-select" style={{ marginRight: '1rem' }}>Select Event:</label>
        <select id="scan-event-select" value={scanEvent} onChange={handleEventChange} style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--dark-green)', color: 'var(--font-light)' }}>
          <option value="lunch-2025-10-29">Lunch - Oct 29</option>
          <option value="dinner-2025-10-29">Dinner - Oct 29</option>
          <option value="lunch-2025-10-30">Lunch - Oct 30</option>
          <option value="dinner-2025-10-30">Dinner - Oct 30</option>
          <option value="lunch-2025-10-31">Lunch - Oct 31</option>
          <option value="dinner-2025-10-31">Dinner - Oct 31</option>
          <option value="lunch-2025-11-01">Lunch - Nov 1</option>
        </select>
      </div>
      <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '15px', overflow: 'hidden' }}></div>
      {feedback.message && (
        <div className="feedback-message" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', fontWeight: 'bold', backgroundColor: feedback.type === 'success' ? 'var(--light-green)' : feedback.type === 'error' ? '#E57373' : 'var(--teal-green)', color: feedback.type === 'success' ? 'var(--darkest-green)' : 'var(--font-light)' }}>
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default Scanner;
