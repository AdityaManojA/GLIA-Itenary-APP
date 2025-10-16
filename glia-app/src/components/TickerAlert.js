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
            if (!snapshot.empty) {
                const alertData = {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data(),
                };
                setLatestAlert(alertData);
            } else {
                setLatestAlert(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading || !latestAlert) {
        return (
            <div className="ticker-bar">
                <p className="ticker-scroll-text" 
                   style={{ animation: 'none', paddingLeft: '1rem', color: '#FFF', position: 'relative' }}>
                    {loading ? 'Loading latest announcements...' : 'No active announcements.'}
                </p>
            </div>
        );
    }
    const baseAlertText = `🚨 ${latestAlert.title}: ${latestAlert.message} 🚨`;
    const largeGap = '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'; 


    let repeatedAlertText = '';
    for (let i = 0; i < 5; i++) {
        repeatedAlertText += baseAlertText + largeGap;
    }

    return (

        <div className="ticker-bar">

            <p className="ticker-scroll-text">
                {repeatedAlertText}
            </p>
        </div>
    );
};

export default TickerAlert;