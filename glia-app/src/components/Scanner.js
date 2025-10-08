import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import participants from '../data/participants.json';

const Scanner = () => {
    const [uiState, setUiState] = useState('choice');
    const [scanResult, setScanResult] = useState(null);
    const [feedback, setFeedback] = useState('Select a meal and date, then scan a QR code.');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Updated state to use a dropdown with specific dates
    const [mealType, setMealType] = useState('Breakfast');
    const [scanDate, setScanDate] = useState('2025-10-29'); // Default to the first day

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (uiState === 'camera' && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    streamRef.current = stream;
                    if(videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    setFeedback('Error: Could not access camera.');
                    setUiState('choice');
                });
        }
        return () => stopCamera();
    }, [uiState]);

    const saveData = async (decodedText) => {
        setIsProcessing(true);
        const participant = participants.find(p => p.reg_no.toLowerCase() === decodedText.toLowerCase());
        
        if (!participant) {
            setFeedback(`Error: Attendee ID "${decodedText}" not found.`);
            setIsProcessing(false);
            return;
        }

        try {
            await addDoc(collection(db, 'scanned_coupons'), {
                attendeeId: participant.reg_no,
                attendeeName: participant.name,
                meal: mealType,
                date: scanDate,
                scannedAt: serverTimestamp()
            });
            setFeedback(`✅ Success! Coupon for ${participant.name} saved.`);
            setScanResult(decodedText);
        } catch (error) {
            setFeedback('❌ Error: Could not save data. Check date restrictions or permissions.');
            console.error("Error saving coupon data: ", error);
        }
        
        setTimeout(() => {
            setIsProcessing(false);
        }, 2000);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFeedback('Scanning image...');
        setScanResult(null);

        const fileScanner = new Html5Qrcode("reader");
        fileScanner.scanFile(file, true)
            .then(decodedText => {
                saveData(decodedText);
            })
            .catch(err => {
                setFeedback('Error: Could not decode QR code from image.');
                setScanResult(null);
            });
    };
    
    const handleCapturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        stopCamera();
        setUiState('preview');
    };

    const handleScanCaptured = () => {
        if (!canvasRef.current) return;
        const dataURL = canvasRef.current.toDataURL('image/png');
        
        fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "capture.png", { type: "image/png" });
                handleFileChange({ target: { files: [file] } });
            });
        
        setUiState('choice');
    };

    return (
        <div className="card glass-effect">
            <h2 style={{ textAlign: 'center' }}>Food Coupon Scanner</h2>
            
            <div className="scanner-setup">
                <div className="input-group">
                    <label htmlFor="scan-date">Date</label>
                    {/* UPDATED: Changed from text input to a select dropdown */}
                    <select id="scan-date" value={scanDate} onChange={e => setScanDate(e.target.value)}>
                        <option value="2025-10-29">October 29</option>
                        <option value="2025-10-30">October 30</option>
                        <option value="2025-10-31">October 31</option>
                        <option value="2025-11-01">November 1</option>
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="meal-type">Meal</label>
                    <select id="meal-type" value={mealType} onChange={e => setMealType(e.target.value)}>
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                    </select>
                </div>
            </div>

            {uiState === 'choice' && (
                <div className="scanner-choice-container">
                    <button onClick={() => setUiState('camera')} className="auth-button" disabled={isProcessing}>Take a Photo</button>
                    <p className="or-text">OR</p>
                    <button onClick={() => fileInputRef.current.click()} className="auth-button" disabled={isProcessing}>Choose Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
            )}

            {uiState === 'camera' && (
                <div className="camera-container">
                    <video ref={videoRef} className="camera-preview" autoPlay playsInline></video>
                    <button onClick={handleCapturePhoto} className="auth-button">Capture Photo</button>
                    <button onClick={() => setUiState('choice')} className="reset-btn" style={{ width: '100%', marginTop: '0.5rem' }}>Cancel</button>
                </div>
            )}

            {uiState === 'preview' && (
                <div className="camera-container">
                    <canvas ref={canvasRef} className="camera-preview"></canvas>
                    <button onClick={handleScanCaptured} className="auth-button">Scan This Photo</button>
                    <button onClick={() => setUiState('camera')} className="reset-btn" style={{ width: '100%', marginTop: '0.5rem' }}>Retake Photo</button>
                </div>
            )}

            <div id="reader" style={{ display: 'none' }}></div>
            
            <div className="scan-result-panel">
                <p className="feedback-text">{feedback}</p>
                {scanResult && (
                    <p className="scan-result-text">Last scan: {scanResult}</p>
                )}
            </div>
        </div>
    );
};

export default Scanner;

