import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // This state will hold the specific meal event we are scanning for
  // e.g., "lunch-2025-10-29"
  const [scanEvent, setScanEvent] = useState('lunch-2025-10-29'); 

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    }, false); // verbose = false

    const onScanSuccess = (decodedText, decodedResult) => {
      // Only process a new scan if we aren't already processing one
      if (!isProcessing) {
        setScanResult(decodedText);
        handleScan(decodedText);
      }
    };

    const onScanError = (errorMessage) => {
      // handle scan error, usually we can ignore this.
    };
    
    scanner.render(onScanSuccess, onScanError);
    
    // Cleanup function to stop the scanner
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode scanner.", error);
      });
    };
  }, [isProcessing]); // Re-run effect if isProcessing changes

  const handleScan = async (userId) => {
    setIsProcessing(true);
    setFeedback({ message: 'Processing...', type: 'info' });

    if (!userId) {
      setFeedback({ message: 'Invalid QR Code.', type: 'error' });
      setIsProcessing(false);
      return;
    }

    try {
      // Create a reference to the document for this specific user and meal event
      const scanDocRef = doc(db, 'scans', scanEvent, 'attendees', userId);
      const docSnap = await getDoc(scanDocRef);

      if (docSnap.exists()) {
        // This user has already been scanned for this event
        const scanTime = docSnap.data().scannedAt.toDate().toLocaleTimeString();
        setFeedback({ message: `ALREADY SCANNED at ${scanTime}`, type: 'error' });
      } else {
        // This is a new scan, record it in Firestore
        await setDoc(scanDocRef, {
          userId: userId,
          scannedAt: serverTimestamp()
        });
        setFeedback({ message: `SUCCESS: ${userId}`, type: 'success' });
      }
    } catch (error) {
      console.error("Error processing scan: ", error);
      setFeedback({ message: 'Error processing scan.', type: 'error' });
    }

    // After a short delay, reset the feedback and allow scanning again
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
      setIsProcessing(false);
    }, 2000); // 2-second cooldown
  };

  // Basic UI to select which meal is being scanned
  const handleEventChange = (e) => {
    setScanEvent(e.target.value);
    setFeedback({ message: `Scanning for ${e.target.options[e.target.selectedIndex].text}`, type: 'info'});
    setTimeout(() => setFeedback({ message: '', type: '' }), 2000);
  };

  return (
    <div className="scanner-container" style={{ textAlign: 'center' }}>
      <h2>Food Coupon Scanner</h2>
      
      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="scan-event-select" style={{ marginRight: '1rem' }}>Select Event:</label>
        <select 
            id="scan-event-select"
            value={scanEvent} 
            onChange={handleEventChange}
            style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--dark-green)', color: 'var(--font-light)' }}
        >
          <option value="lunch-2025-10-29">Lunch - Oct 29</option>
          <option value="dinner-2025-10-29">Dinner - Oct 29</option>
          <option value="lunch-2025-10-30">Lunch - Oct 30</option>
          <option value="dinner-2025-10-30">Dinner - Oct 30</option>
          <option value="lunch-2025-10-31">Lunch - Oct 31</option>
          <option value="dinner-2025-10-31">Dinner - Oct 31</option>
          <option value="lunch-2025-11-01">Lunch - Nov 1</option>
        </select>
      </div>

      <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      
      {feedback.message && (
        <div 
            className="feedback-message"
            style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderRadius: '10px',
                fontWeight: 'bold',
                backgroundColor: feedback.type === 'success' ? 'var(--light-green)' : feedback.type === 'error' ? '#E57373' : 'var(--teal-green)',
                color: feedback.type === 'success' ? 'var(--darkest-green)' : 'var(--font-light)'
            }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default Scanner;
