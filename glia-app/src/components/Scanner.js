import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import participants from '../data/participants.json';
import SortedLiveScans from './SortedLiveScans'; 

const qrcodeRegionId = "reader";

const Scanner = () => {
    // Define style objects ONLY ONCE inside the component function
    const buttonStyle = {
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '100px',
        padding: '0.5rem',
        lineHeight: '1.2',
        fontSize: '1rem',
        marginTop: '0', 
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0', 
        marginTop: '1.5rem',
        boxSizing: 'border-box',
    };
    
    const stopButtonStyle = {
        width: '100%', 
        height: '100px',
        backgroundColor: 'var(--primary-color)', 
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };
    
  const [activeTab, setActiveTab] = useState('scanner'); 
  const [uiState, setUiState] = useState('choice'); 
  const [scanResult, setScanResult] = useState(null); 
  const [feedback, setFeedback] = useState('Select a meal and date, then choose a scanning method.');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Setting default meal to Lunch since Breakfast is being removed
  const [mealType, setMealType] = useState('Lunch');
  const [scanDate, setScanDate] = useState('2025-10-29');

  const [scanHistory, setScanHistory] = useState([]);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null); 
  const fileScannerRef = useRef(null); 

  // --- Scanner Control Functions ---
  
  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current.isScanning) { 
        html5QrCodeRef.current.stop()
          .then(() => {
            console.log("QR Code scanning stopped.");
            document.getElementById(qrcodeRegionId).style.display = 'none'; 
          })
          .catch(err => console.error("Error stopping QR Code scanning: ", err));
      }
      html5QrCodeRef.current = null;
    }
  };

  const startScanner = () => {
    if (isProcessing) return;
        
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
            if (!isProcessing) {
              handleScanSuccess(decodedText, 'realtime');
            }
          },
          (errorMessage) => {
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
        if (activeTab !== 'scanner') {
            stopScanner();
        }
    return () => stopScanner();
  }, [activeTab]);

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
        scanTime = duplicateDoc.scannedAt.toDate().toLocaleTimeString([], {
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
      setScanResult(attendeeId); 

      const newEntry = {
        id: attendeeId,
        name: participant.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
            // Ensure no duplicates in history based on ID, and keep it to last 15
            setScanHistory(prevHistory => {
                const filtered = prevHistory.filter(item => item.id !== newEntry.id);
                return [newEntry, ...filtered].slice(0, 15);
            });

      return true;
    } catch (error) {
      console.error("[SaveData] Error saving coupon data: ", error);
      setFeedback('❌ Error: Could not save data. Check permissions.');
      return false;
    }
  };

  const handleScanSuccess = async (decodedText, source) => {
    if (isProcessing) return; 

    setIsProcessing(true);
    setFeedback(`Processing scan from ${source}...`);
    setScanResult(null);
    
    const cleanedId = decodedText.trim();
    
    console.log("-----------------------------------------");
    console.log(`[ScanSuccess] Raw QR Text: "${decodedText}"`);
    console.log(`[ScanSuccess] Trimmed ID: "${cleanedId}"`);
    
    if (source === 'file') {
      stopScanner(); 
    }

    const participant = participants.find(p => p.reg_no.toLowerCase() === cleanedId.toLowerCase());
    
    console.log(`[ScanSuccess] Participant Lookup Status (Found/Not Found): ${!!participant}`);

    await saveData(cleanedId, participant); 

    setTimeout(() => {
      setIsProcessing(false);
      setScanResult(null); 
      
      if (source === 'realtime') {
       setUiState('scanning');
       setFeedback('Scanning active. Point camera at the next QR code...');
      } else {
       setUiState('choice');
      }
      
      console.log("-----------------------------------------");
    }, 2000); 
  };
  
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
        <div className="card glass-effect" style={{ 
            marginTop: '1.5rem', 
            marginBottom: '0.5rem',
            backgroundColor: 'var(--surface-color)', 
            padding: '1rem', 
            width: '100%',
            boxSizing: 'border-box',
        }}>
            <h4 style={{ 
                margin: '0 0 0.8rem 0', 
                color: 'var(--text-primary)', 
                borderBottom: '1px solid var(--text-secondary)', 
                paddingBottom: '0.5rem',
                fontSize: '1.2rem',
                textAlign: 'left', 
                fontWeight: '700'
            }}>
                Last 15 Successful Scans:
            </h4>
            {scanHistory.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-secondary)', textAlign: 'left', fontSize: '1.1rem' }}>
                    No history yet.
                </p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {scanHistory.map((item, index) => (
                        <li key={item.id + item.time} style={{ 
                            marginBottom: '0.5rem', 
                            padding: '0.3rem 0',
                            display: 'flex',
                            flexDirection: 'column', 
                            textAlign: 'left',
                            /* Use a subtle sub-card background for better visual separation */
                            backgroundColor: '#F5F5F5', 
                            borderRadius: '4px',
                            padding: '0.5rem 0.8rem',
                            
                            /* Ensure consistent spacing and clear differentiation */
                            borderBottom: index < scanHistory.length - 1 ? '1px dashed var(--text-secondary)' : 'none' 
                        }}>
                            {/* Time: Primary color (red), bold, matching the alert timestamp color scheme */}
                            <span style={{ 
                                color: 'var(--primary-color)', 
                                fontWeight: '700', 
                                fontSize: '1.2rem', 
                                marginBottom: '0.1rem',
                            }}>{item.time}</span>
                            
                            {/* Name (ID): Use black/primary text, bold, matching the alert title look */}
                            <span style={{
                                color: 'var(--text-primary)',
                                fontWeight: '700', 
                                fontSize: '1.3rem', 
                                lineHeight: '1.3'
                            }}>{item.name} ({item.id})</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );


    const currentFeedbackStyle = {
        textAlign: 'center',
        fontSize: '1.1rem',
        fontWeight: '600',
        padding: '1rem 0',
        minHeight: '40px',
        color: feedback.startsWith('❌') || feedback.startsWith('⚠️') ? 'var(--primary-color)' : 'var(--text-primary)',
    };


  return (
    <div className="card glass-effect">
            {/* Tabs Navigation */}
            <nav className="tabs-nav" style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '0.5rem' }}>
                <button 
                    onClick={() => setActiveTab('scanner')} 
                    className={activeTab === 'scanner' ? 'tab-active' : ''}
                    style={{ minWidth: '150px' }}
                >
                    Coupon Scanner
                </button>
                <button 
                    onClick={() => setActiveTab('scannedList')} 
                    className={activeTab === 'scannedList' ? 'tab-active' : ''}
                    style={{ minWidth: '150px' }}
                >
                    Scanned List
                </button>
            </nav>
            
            {/* CONTENT AREA */}
            
            {/* Scanner View */}
            {activeTab === 'scanner' && (
                <>
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
                                <option>Lunch</option>
                                <option>Dinner</option>
                            </select>
                        </div>
                    </div>

                    <div id={qrcodeRegionId} style={{ 
                        width: '100%', 
                        marginBottom: '1rem', 
                        border: uiState === 'scanning' ? '2px solid var(--primary-color)' : 'none', 
                        aspectRatio: '1/1',
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
                            <button onClick={handleStopClick} className="auth-button" style={stopButtonStyle}>Stop Scan</button>
                        )}
                    </div>
                    
                    {/* Feedback area (now directly styled) */}
                    <div style={{ padding: '0 1rem', width: '100%', boxSizing: 'border-box' }}>
                        <p style={currentFeedbackStyle}>
                            {feedback}
                        </p>
                    </div>
                    
                    {/* Scan History Display */}
                    <div style={{ padding: '0 1rem', width: '100%', boxSizing: 'border-box' }}>
                        {ScanHistoryBox()}
                    </div>
                </>
            )}

            {/* Scanned List View (using the existing Admin component logic) */}
            {activeTab === 'scannedList' && (
                <SortedLiveScans /> 
            )}

    </div>
  );
};

export default Scanner;