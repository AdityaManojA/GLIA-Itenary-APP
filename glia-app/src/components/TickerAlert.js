
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const TickerAlert = () => {
    const [latestAlert, setLatestAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLoading(false);

            if (!snapshot.empty) {
                const alertData = {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data(),
                };
                setLatestAlert(alertData);
            } else {
                setLatestAlert(null);
            }
        }, (error) => {
            console.error("[Ticker] Firebase Listener Error:", error);
            setLoading(false);
            setLatestAlert(null);
        });

        return () => unsubscribe();
    }, []);

    // --- Content Generation Logic ---
    let textToRender = '';
    let isScrolling = true;

    if (loading) {
        textToRender = 'Loading conference announcements. Please wait...';
        isScrolling = false; // Placeholder should NOT scroll
    } else if (latestAlert) {
        const baseAlertText = `🚨 ${latestAlert.title}: ${latestAlert.message} 🚨`;
        const largeGap = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'; 
        
        for (let i = 0; i < 5; i++) {
            textToRender += baseAlertText + largeGap;
        }
    } else {
        textToRender = 'No active announcements.';
        isScrolling = false; // Placeholder should NOT scroll
    }
    
    // Final Render: Dynamically set the styles based on the scrolling state
    return (
        <div className="ticker-bar">
            <p className="ticker-scroll-text" 
               style={{ 
                   // Set animation to 'marquee' if alert data is ready, otherwise 'none'
                   animation: isScrolling ? 'marquee 40s linear infinite' : 'none',
                   
                   // CRITICAL: Force non-scrolling text to be visible and centered (no 100% left offset)
                   position: isScrolling ? 'absolute' : 'relative',
                   left: isScrolling ? '0' : '50%',
                   transform: isScrolling ? 'none' : 'translateX(-50%)',
                   paddingLeft: isScrolling ? '100%' : '1rem', // Padding left 1rem when static
                   whiteSpace: 'nowrap',
                   width: isScrolling ? 'auto' : 'max-content',
                   display: 'inline-block'
               }}>
                {textToRender}
            </p>
        </div>
    );
};

export default TickerAlert;