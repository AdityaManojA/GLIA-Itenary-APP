import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const FoodCouponsList = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'scanned_coupons'), orderBy('scannedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scannedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setScans(scannedData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const groupScans = (scans) => {
        return scans.reduce((acc, scan) => {
            if (!scan.scannedAt) return acc; 
            const date = scan.scannedAt.toDate().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
            const meal = scan.meal;

            if (!acc[date]) {
                acc[date] = {};
            }
            if (!acc[date][meal]) {
                acc[date][meal] = [];
            }
            acc[date][meal].push(scan);
            return acc;
        }, {});
    };

    if (loading) {
        return <p>Loading coupon list...</p>;
    }

    const groupedScans = groupScans(scans);

    return (
        <div>
            <h2>Scanned Food Coupons List</h2>
            {Object.keys(groupedScans).length === 0 ? (
                <p>No coupons have been scanned yet.</p>
            ) : (
                Object.keys(groupedScans).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                    <div key={date}>
                        <h3 className="coupon-date-header">{date}</h3>
                        {Object.keys(groupedScans[date]).sort().map(meal => ( 
                            <div key={meal} className="coupon-meal-group">
                                <h4>{meal} ({groupedScans[date][meal].length} scanned)</h4>
                                <ul className="coupon-list">
                                    {groupedScans[date][meal].map(scan => (
                                        <li key={scan.id}>
                                            <span>{scan.attendeeName} ({scan.attendeeId})</span>
                                            <span className="scan-timestamp">
                                                {scan.scannedAt.toDate().toLocaleTimeString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default FoodCouponsList;

