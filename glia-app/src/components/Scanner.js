import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import participants from '../data/participants.json';

// Define the ID for the QR code reader container
const qrcodeRegionId = "reader";

const Scanner = () => {
    // uiState: 'choice', 'scanning', or 'file_scan'
    const [uiState, setUiState] = useState('choice'); 
    const [scanResult, setScanResult] = useState(null);
    const [feedback, setFeedback] = useState('Select a meal and date, then choose a scanning method.');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [mealType, setMealType] = useState('Breakfast');
    const [scanDate, setScanDate] = useState('2025-10-29');

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
        stopScanner(); // Ensure any existing scanner is stopped

        const html5QrCode = new Html5Qrcode(qrcodeRegionId);
        html5QrCodeRef.current = html5QrCode;
        
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
                html5QrCode.start(
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

    const saveData = async (decodedText, participant) => {
        if (!participant) {
            setFeedback(`❌ Error: Attendee ID "${decodedText}" not found.`);
            return false;
        }
        
        const attendeeId = participant.reg_no;
        
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
            setFeedback(`✅ Success! Coupon for ${participant.name} saved.`);
            setScanResult(decodedText);
            return true;
        } catch (error) {
            setFeedback('❌ Error: Could not save data. Check permissions.');
            console.error("Error saving coupon data: ", error);
            return false;
        }
    };

    const handleScanSuccess = async (decodedText, source) => {
        // This blocks repeated calls while the delay is active
        if (isProcessing) return; 

        setIsProcessing(true);
        setFeedback(`Processing scan from ${source}...`);
        setScanResult(null);
        
        // 1. STOP THE SCANNER AND FREEZE THE VIEW
        if (source === 'realtime') {
            stopScanner(); // This stops the camera feed and hides the div.
        }

        // Find participant
        const participant = participants.find(p => p.reg_no.toLowerCase() === decodedText.toLowerCase());

        // Process data (save or show duplicate warning)
        await saveData(decodedText, participant);

        // 2. After the delay, clear 'isProcessing' and REVERT TO CHOICE
        setTimeout(() => {
            setIsProcessing(false);
            setScanResult(null); 
            
            // Revert to 'choice' state to show the 'Start Real-time Scan' button
            setUiState('choice');
            
            // The success/warning message remains visible for the rest of the 5s delay
            setFeedback(prevFeedback => {
                if (prevFeedback.startsWith('✅') || prevFeedback.startsWith('⚠️') || prevFeedback.startsWith('❌')) {
                    return prevFeedback; // Keep the final message
                }
                return 'Ready to scan. Press "Start Real-time Scan" for the next coupon.';
            });
        }, 5000); // 5-second reading time
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

            <div className="scanner-choice-container">
                {uiState === 'choice' || uiState === 'file_scan' ? (
                    <>
                        <button onClick={startScanner} className="auth-button" disabled={isProcessing}>Start Real-time Scan</button>
                        <p className="or-text">OR</p>
                        <button onClick={() => fileInputRef.current.click()} className="auth-button" disabled={isProcessing}>Upload Image</button>
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
                <p className={`feedback-text ${isProcessing ? 'processing' : ''}`}>
                    {isProcessing && uiState === 'scanning' ? 'PROCESSING SCAN...' : ''}
                    {isProcessing && uiState === 'file_scan' ? 'SCANNING IMAGE...' : ''}
                    {!isProcessing ? feedback : ''}
                </p>
                {scanResult && (
                    <p className="scan-result-text">Last successful scan: **{scanResult}**</p>
                )}
            </div>
        </div>
    );
};

export default Scanner;