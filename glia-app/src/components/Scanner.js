import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const Scanner = () => {
    const [uiState, setUiState] = useState('choice'); // 'choice', 'camera', 'preview'
    const [scanResult, setScanResult] = useState(null);
    const [feedback, setFeedback] = useState('Scan or upload an image to see the result.');
    const [capturedImage, setCapturedImage] = useState(null); // Holds the captured image data URL
    const [isCameraReady, setIsCameraReady] = useState(false); // State to track if video stream is ready

    const videoRef = useRef(null);
    const canvasRef = useRef(null); // This ref is now for a hidden canvas
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);

    // Function to safely stop the camera stream
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        // Stop the camera if the UI state changes away from 'camera'
        if (uiState !== 'camera') {
            stopCamera();
            setIsCameraReady(false);
        }

        if (uiState === 'camera' && videoRef.current) {
            setIsCameraReady(false); // Set to false while camera is initializing
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    setFeedback('Error: Could not access camera. Please grant permission.');
                    setUiState('choice');
                });
        }

        // Cleanup function to ensure camera stops when component is unmounted
        return () => {
            stopCamera();
        };
    }, [uiState]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFeedback('Scanning image...');
        setScanResult(null);

        const fileScanner = new Html5Qrcode("reader");
        fileScanner.scanFile(file, true)
            .then(decodedText => {
                setFeedback('Scan Successful!');
                setScanResult(decodedText);
            })
            .catch(err => {
                setFeedback('Error: Could not decode QR code from image.');
                setScanResult(null);
            });
    };
    
    const handleCapturePhoto = () => {
        if (!videoRef.current || !canvasRef.current || !isCameraReady) {
            console.error("Capture button clicked before camera was fully ready.");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        stopCamera();
        
        const dataURL = canvas.toDataURL('image/png');
        setCapturedImage(dataURL); // Save the captured image data
        setUiState('preview');
    };

    const handleScanCaptured = () => {
        if (!capturedImage) return;
        
        // Convert the captured image Data URL to a File object for scanning
        fetch(capturedImage)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "capture.png", { type: "image/png" });
                handleFileChange({ target: { files: [file] } });
            });
        
        setUiState('choice');
        setCapturedImage(null); // Clear the captured image
    };
    
    // This function will be called once the video stream has loaded its metadata
    const onVideoReady = () => {
        setIsCameraReady(true);
    };

    return (
        <div className="card glass-effect">
            <h2 style={{ textAlign: 'center' }}>QR Code Scanner</h2>

            {uiState === 'choice' && (
                <div className="scanner-choice-container">
                    <button onClick={() => setUiState('camera')} className="auth-button">
                        Take a Photo
                    </button>
                    <p className="or-text">OR</p>
                    <button onClick={() => fileInputRef.current.click()} className="auth-button">
                        Choose Image
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
            )}

            {uiState === 'camera' && (
                <div className="camera-container">
                    <video ref={videoRef} className="camera-preview" autoPlay playsInline onLoadedData={onVideoReady}></video>
                    <button onClick={handleCapturePhoto} className="auth-button" disabled={!isCameraReady}>
                        {isCameraReady ? 'Capture Photo' : 'Starting Camera...'}
                    </button>
                    <button onClick={() => setUiState('choice')} className="reset-btn" style={{ width: '100%', marginTop: '0.5rem' }}>Cancel</button>
                </div>
            )}

            {uiState === 'preview' && (
                <div className="camera-container">
                    {/* Display the captured image for preview */}
                    <img src={capturedImage} alt="Captured QR Code" className="camera-preview" />
                    <button onClick={handleScanCaptured} className="auth-button">Scan This Photo</button>
                    <button onClick={() => setUiState('camera')} className="reset-btn" style={{ width: '100%', marginTop: '0.5rem' }}>Retake Photo</button>
                </div>
            )}

            {/* Hidden elements needed by the libraries */}
            <div id="reader" style={{ display: 'none' }}></div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            
            <div className="scan-result-panel">
                <p className="feedback-text">{feedback}</p>
                {scanResult && (
                    <p className="scan-result-text">{scanResult}</p>
                )}
            </div>
        </div>
    );
};

export default Scanner;

