import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import participants from '../data/participants.json';

// Define the ID for the QR code reader container
const qrcodeRegionId = "reader";

// Define inline styles for the buttons to override problematic global/mobile CSS
const buttonStyle = {
    // Force button to be a flex column to center wrapping text
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',

    // Ensure size and clear margins for proper flex distribution
    height: '100px',
    padding: '0.5rem',
    lineHeight: '1.2',
    fontSize: '1rem',
    marginTop: '0', 
    
    // Set flexible horizontal width
    flexGrow: 1, 
    flexBasis: '45%', 
    maxWidth: '45%', 
};

const orTextStyle = {
    flexShrink: 0,
    padding: '0 0.2rem',
    lineHeight: '1.2',
    margin: '0', 
};

const scannerContainerStyle = {
    // Use flex for horizontal layout
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    
    // CRITICAL FIX: Ensure the container uses 100% of the inner space 
    width: '100%',
    padding: '0', 
    
    // Ensure this container stacks correctly vertically
    marginTop: '1.5rem',
    boxSizing: 'border-box',
};


const Scanner = () => {
  // uiState: 'choice', 'scanning', or 'file_scan'
  const [uiState, setUiState] = useState('choice'); 
  const [scanResult, setScanResult] = useState(null);
  const [feedback, setFeedback] = useState('Select a meal and date, then choose a scanning method.');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [mealType, setMealType] = useState('Breakfast');
  const [scanDate, setScanDate] = useState('2025-10-29');

    // NEW STATE: Stores the last 5 successful scans
    const [scanHistory, setScanHistory] = useState([]);

  // Ref for the Html5QrcodeScanner instance for real-time scanning
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input
  const fileScannerRef = useRef(null); // Ref for the file scanning instance

  // --- Scanner Control Functions ---
  
  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) { 
        html5QrCodeRef.current.stop()
          .then(() => {
            console.log("QR Code scanning stopped.");
            // This hides the camera feed div
            document.getElementById(qrcodeRegionId).style.display = 'none'; 
          })
          .catch(err => console.error("Error stopping QR Code scanning: ", err));
      }
      html5QrCodeRef.current = null;
    }
  };

  const startScanner = () => {
    if (isProcessing) return;
        
        // Only initialize if we don't have an instance yet
        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);
        }

    document.getElementById(qrcodeRegionId).style.display = 'block';

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      videoConstraints: {
        facingMode: { ideal: "environment" }
      }
    };

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCodeRef.current.start(
          cameraId,
          config,
          (decodedText, decodedResult) => {
            // Success callback: check processing state before handling scan
            if (!isProcessing) {
              handleScanSuccess(decodedText, 'realtime');
            }
          },
          (errorMessage) => {
            // Failure callback (ignored for continuous scanning)
          }
        ).catch((err) => {
          setFeedback('❌ Error: Could not start camera/scanner. Check permissions.');
          setUiState('choice');
          console.error("Failed to start scanning:", err);
        });
        setUiState('scanning');
        setFeedback('Scanning active. Point camera at a QR code...');
      } else {
        setFeedback('❌ Error: No camera found.');
        setUiState('choice');
      }
    }).catch(err => {
      setFeedback('❌ Error: Could not access camera devices.');
      setUiState('choice');
    });
  };

  // --- Effect Hook for Cleanup ---
  useEffect(() => {
    return () => stopScanner(); // Cleanup function
  }, []);

  // --- Data and Scan Handling ---

  const saveData = async (attendeeId, participant) => { 
    console.log(`[SaveData] Attempting to save data for cleaned ID: "${attendeeId}"`);

    if (!participant) {
      console.log(`[SaveData] Participant not found in list for ID: "${attendeeId}"`);
      setFeedback(`❌ Error: Attendee ID "${attendeeId}" not found.`); 
      return false;
    }
    
    console.log(`[SaveData] Participant found: ${participant.name}`);
    
    const checkQuery = query(
      collection(db, 'scanned_coupons'),
      where('attendeeId', '==', attendeeId),
      where('meal', '==', mealType),
      where('date', '==', scanDate)
    );

    const snapshot = await getDocs(checkQuery);
    if (!snapshot.empty) {
      
      const duplicateDoc = snapshot.docs[0].data();
      let scanTime = 'an unknown time';
      
      if (duplicateDoc.scannedAt && duplicateDoc.scannedAt.toDate) {
        scanTime = duplicateDoc.scannedAt.toDate().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      
      console.log(`[SaveData] Duplicate scan found.`);
      setFeedback(`⚠️ Warning: Coupon for ${participant.name} (${attendeeId}) already scanned for ${mealType} on ${scanDate} at ${scanTime}.`);
      
      return false;
    }

    try {
      await addDoc(collection(db, 'scanned_coupons'), {
        attendeeId: attendeeId,
        attendeeName: participant.name,
        meal: mealType,
        date: scanDate,
        scannedAt: serverTimestamp()
      });
      console.log(`[SaveData] Successful save to Firebase.`);
      setFeedback(`✅ Success! Coupon for ${participant.name} saved.`);
      setScanResult(attendeeId); // Use cleaned ID for successful result display

            // NEW LOGIC: Update scan history ONLY on successful save
            const newEntry = {
                id: attendeeId,
                name: participant.name,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setScanHistory(prevHistory => [newEntry, ...prevHistory].slice(0, 5));

      return true;
    } catch (error) {
      console.error("[SaveData] Error saving coupon data: ", error);
      setFeedback('❌ Error: Could not save data. Check permissions.');
      return false;
    }
  };

  const handleScanSuccess = async (decodedText, source) => {
    // This blocks repeated calls while the delay is active
    if (isProcessing) return; 

    setIsProcessing(true);
    setFeedback(`Processing scan from ${source}...`);
    setScanResult(null);
    
    // 1. CRITICAL FIX: TRIM WHITESPACE FROM THE DECODED TEXT
    const cleanedId = decodedText.trim();
    
    // LOGS START HERE
    console.log("-----------------------------------------");
    console.log(`[ScanSuccess] Raw QR Text: "${decodedText}"`);
    console.log(`[ScanSuccess] Trimmed ID: "${cleanedId}"`);
    
    // 2. DO NOT STOP THE SCANNER IF REALTIME!
    if (source === 'file') {
      stopScanner(); // ONLY stop if scanning from a file upload
    }

    // Find participant using the cleaned ID
    const participant = participants.find(p => p.reg_no.toLowerCase() === cleanedId.toLowerCase());
    
    console.log(`[ScanSuccess] Participant Lookup Status (Found/Not Found): ${!!participant}`);

    // Process data (save or show duplicate warning)
    await saveData(cleanedId, participant); // Pass the cleaned ID

    // 3. After the delay, clear 'isProcessing' and resume continuous scan
    setTimeout(() => {
      setIsProcessing(false);
      setScanResult(null); 
      
      // If source was realtime, go back to scanning state (keeping camera feed active)
      if (source === 'realtime') {
       setUiState('scanning');
       setFeedback('Scanning active. Point camera at the next QR code...');
      } else {
       // If source was file, revert to choice state
       setUiState('choice');
      }
      
      console.log("-----------------------------------------");
    }, 2000); // Reduced visual feedback time to 2 seconds for faster continuous scanning
  };
  
  // --- File/Image Scanning Functionality ---

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    stopScanner(); 
    
    setFeedback('Scanning image...');
    setScanResult(null);
    setIsProcessing(true);
    setUiState('file_scan');

    if (!fileScannerRef.current) {
      fileScannerRef.current = new Html5Qrcode(qrcodeRegionId);
    }

    const fileScanner = fileScannerRef.current;
    
    fileScanner.scanFile(file, true)
      .then(decodedText => {
        handleScanSuccess(decodedText, 'file');
      })
      .catch(err => {
        console.error("File scan failed:", err);
        setFeedback('❌ Error: Could not decode QR code from image. Try a higher resolution picture.');
        setScanResult(null);
        setIsProcessing(false);
        setUiState('choice');
      });
    
    event.target.value = null; 
  };

  const handleStopClick = () => {
    stopScanner();
    setUiState('choice');
    setFeedback('Scan stopped. Choose an option to continue.');
  };

    // Component to display the history
    const ScanHistoryBox = () => (
        <div className="scan-history-box" style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            backgroundColor: '#fff',
            fontSize: '0.9rem'
        }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', borderBottom: '1px solid #eee', paddingBottom: '0.3rem' }}>
                Last 5 Successful Scans:
            </h4>
            {scanHistory.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No history yet.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {scanHistory.map((item, index) => (
                        <li key={index} style={{ marginBottom: '0.3rem', fontWeight: '500' }}>
                            <span style={{ color: 'var(--primary-color)' }}>{item.time}</span>: {item.name} ({item.id})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

  return (
    <div className="card glass-effect">
      <h2 style={{ textAlign: 'center' }}>Food Coupon Scanner</h2>

      <div className="scanner-setup">
        <div className="input-group">
          <label htmlFor="scan-date">Date</label>
          <select id="scan-date" value={scanDate} onChange={e => { setScanDate(e.target.value); setScanResult(null); }}>
            <option value="2025-10-29">October 29</option>
            <option value="2025-10-30">October 30</option>
            <option value="2025-10-31">October 31</option>
            <option value="2025-11-01">November 1</option>
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="meal-type">Meal</label>
          <select id="meal-type" value={mealType} onChange={e => { setMealType(e.target.value); setScanResult(null); }}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </select>
        </div>
      </div>

      <div id={qrcodeRegionId} style={{ 
        width: '100%', 
        marginBottom: '1rem', 
        border: uiState === 'scanning' ? '2px solid #007bff' : 'none', 
        aspectRatio: '1/1',
        // Display is controlled by startScanner/stopScanner functions
        display: uiState === 'scanning' ? 'block' : 'none' 
      }}>
      </div>

      <div className="scanner-choice-container" style={scannerContainerStyle}>
        {uiState === 'choice' || uiState === 'file_scan' ? (
          <>
            <button onClick={startScanner} className="auth-button" disabled={isProcessing} style={buttonStyle}>Start Real-time Scan</button>
            <p className="or-text" style={orTextStyle}>OR</p>
            <button onClick={() => fileInputRef.current.click()} className="auth-button" disabled={isProcessing} style={buttonStyle}>Upload Image</button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
          </>
        ) : (
          // When in 'scanning' state but we just stopped the camera, 
          // we show the stop button (or nothing) but the message remains visible below.
          <button onClick={handleStopClick} className="reset-btn" style={{ visibility: 'hidden' }}>Stop Scan</button>
        )}
      </div>
      
      <div className="scan-result-panel">
        <p className={`feedback-text ${isProcessing ? 'processing' : ''}`} style={{ textAlign: 'center' }}>
          {isProcessing && uiState === 'scanning' ? 'PROCESSING SCAN...' : ''}
          {isProcessing && uiState === 'file_scan' ? 'SCANNING IMAGE...' : ''}
          {!isProcessing ? feedback : ''}
        </p>
        {scanResult && (
          <p className="scan-result-text">Last successful scan: {scanResult}</p>
        )}
      </div>
            
            {/* NEW: Display Scan History */}
            {ScanHistoryBox()}

    </div>
  );
};

export default Scanner;