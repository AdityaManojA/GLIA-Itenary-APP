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
                <p className="ticker-content">{loading ? 'No New Alert' : 'No active announcements.'}</p>
            </div>
        );
    }


    const alertText = `🔔 ${latestAlert.title}: ${latestAlert.message} 🔔 `;

    return (
        
        <div className="ticker-bar">
            
            <p className="ticker-scroll-text" data-text={alertText}>
                {alertText}
            </p>
        </div>
    );
};

export default TickerAlert;