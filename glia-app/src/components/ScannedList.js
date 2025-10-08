import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const ScannedList = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sets up a real-time listener for scanned coupons, ordered by the scan time
        const q = query(collection(db, 'scanned_coupons'), orderBy('scannedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scannedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setScans(scannedData);
            setLoading(false);
        });
        return () => unsubscribe(); // Cleanup function
    }, []);

    const handleDownload = () => {
        if (scans.length === 0) {
            alert("There is no data to download.");
            return;
        }

        // Create CSV headers
        const headers = ["Attendee ID", "Attendee Name", "Meal", "Date", "Scanned At"];
        const csvRows = [headers.join(',')];

        // Create a row for each scan
        scans.forEach(scan => {
            // Convert Firestore Timestamp to local string
            const timestamp = scan.scannedAt ? scan.scannedAt.toDate().toLocaleString() : 'N/A';
            
            // Wrap data in quotes to handle commas within names/IDs
            const row = [
                `"${scan.attendeeId}"`,
                `"${scan.attendeeName}"`,
                `"${scan.meal}"`,
                `"${scan.date}"`,
                `"${timestamp}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

        // Create a link and trigger the download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "scanned-coupons-list.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const groupScans = (scans) => {
        return scans.reduce((acc, scan) => {
            if (!scan.scannedAt) return acc;
            
            // Format date for grouping header (e.g., "Wednesday, October 29, 2025")
            const date = scan.scannedAt.toDate().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
            const meal = scan.meal;

            if (!acc[date]) acc[date] = {};
            if (!acc[date][meal]) acc[date][meal] = [];
            acc[date][meal].push(scan);
            return acc;
        }, {});
    };

    if (loading) {
        return <p>Loading scanned list...</p>;
    }

    const groupedScans = groupScans(scans);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Scanned Coupons List</h2>
                <button onClick={handleDownload} className="auth-button" style={{ marginTop: 0 }}>Download as CSV</button>
            </div>
            {Object.keys(groupedScans).length === 0 ? (
                <p>No coupons have been scanned yet.</p>
            ) : (
                // Sort by date descending
                Object.keys(groupedScans).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                    <div key={date}>
                        <h3 className="coupon-date-header">{date}</h3>
                        {/* Sort meals alphabetically */}
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

export default ScannedList;