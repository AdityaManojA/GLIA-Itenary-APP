import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import participants from '../data/participants.json';

const qrcodeRegionId = "reader";

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


const Scanner = () => {
  const [uiState, setUiState] = useState('choice'); 
  const [scanResult, setScanResult] = useState(null);
  const [feedback, setFeedback] = useState('Select a meal and date, then choose a scanning method.');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [mealType, setMealType] = useState('Breakfast');
  const [scanDate, setScanDate] = useState('2025-10-29');

  const [scanHistory, setScanHistory] = useState([]);

  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null); 
  const fileScannerRef = useRef(null); 

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

  useEffect(() => {
    return () => stopScanner();
  }, []);

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
      setScanResult(attendeeId); 

      const newEntry = {
        id: attendeeId,
        name: participant.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
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

    const ScanHistoryBox = () => (
        <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            border: '1px solid #E0E0E0', 
            borderRadius: '8px',
            backgroundColor: 'var(--surface-color)', /* Use UI color for background */
            width: '100%',
            boxSizing: 'border-box',
        }}>
            <h4 style={{ 
                margin: '0 0 0.8rem 0', 
                color: 'var(--primary-color)', 
                borderBottom: '1px solid #D0D0D0', 
                paddingBottom: '0.5rem',
                fontSize: '1.2rem',
                textAlign: 'center'
            }}>
                Last 15 Scans
            </h4>
            {scanHistory.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-secondary)', textAlign: 'center', fontSize: '1rem' }}>
                    No history yet.
                </p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {scanHistory.map((item, index) => (
                        <li key={item.id + item.time} style={{ 
                            marginBottom: '0.5rem', 
                            fontWeight: '600', 
                            fontSize: '1.05rem', /* Larger text for readability */
                            color: 'var(--text-primary)',
                            padding: '0.3rem 0',
                            borderBottom: index < scanHistory.length - 1 ? '1px dashed #E0E0E0' : 'none'
                        }}>
                            <span style={{ 
                                color: index === 0 ? 'var(--primary-color)' : 'var(--text-secondary)', /* Highlight the latest scan */
                                fontWeight: index === 0 ? '700' : '500',
                                display: 'inline-block',
                                minWidth: '70px',
                            }}>{item.time}</span>: {item.name} ({item.id})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    // Final Feedback Styling
    const feedbackStyle = {
        textAlign: 'center',
        fontSize: '1.1rem',
        fontWeight: '600',
        padding: '1rem 0',
        minHeight: '40px',
        color: feedback.startsWith('❌') || feedback.startsWith('⚠️') ? 'var(--primary-color)' : 'var(--text-primary)',
    };
    
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

          <button onClick={handleStopClick} className="reset-btn" >Stop Scan</button>
        )}
      </div>

            <div style={{ padding: '0 1rem', width: '100%', boxSizing: 'border-box' }}>
                <p style={feedbackStyle}>
          {feedback}
        </p>
            </div>
      
      
      <div style={{ padding: '0 1rem', width: '100%', boxSizing: 'border-box' }}>
                {ScanHistoryBox()}
            </div>

    </div>
  );
};

export default Scanner;