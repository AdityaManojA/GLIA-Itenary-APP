import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define custom order arrays outside the component
const mealOrder = ["Breakfast", "Lunch", "Dinner"];
const dateOrder = ["2025-10-29", "2025-10-30", "2025-10-31", "2025-11-01"];

// Helper function to sort dates based on the custom order array
const sortDates = (dateA, dateB) => {
    const indexA = dateOrder.indexOf(dateA);
    const indexB = dateOrder.indexOf(dateB);
    if (indexA === -1 || indexB === -1) return 0; // Fallback
    return indexA - indexB;
};

const SortedLiveScans = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all scanned data in real-time, ordered by newest scan first
        const q = query(collection(db, 'scanned_coupons'), orderBy('scannedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const scannedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setScans(scannedData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching scanned data: ", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDownload = () => {
        if (scans.length === 0) {
            alert("There is no data to download.");
            return;
        }

        // Generate CSV content using the raw, unsorted scans (or you can use the sorted one)
        const headers = ["Attendee ID", "Attendee Name", "Meal", "Date", "Scanned At"];
        const csvRows = [headers.join(',')];

        // Format data into CSV rows
        scans.forEach(scan => {
            const timestamp = scan.scannedAt ? scan.scannedAt.toDate().toLocaleString() : 'N/A';
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
        
        // Trigger download
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "sorted-live-scans.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const groupAndSortScans = (data) => {
        const grouped = data.reduce((acc, scan) => {
            const date = scan.date;
            const meal = scan.meal;
            if (!acc[date]) acc[date] = {};
            if (!acc[date][meal]) acc[date][meal] = [];
            acc[date][meal].push(scan);
            return acc;
        }, {});

        const sortedDates = Object.keys(grouped).sort(sortDates);
        
        const sortedResult = {};
        sortedDates.forEach(date => {
            sortedResult[date] = {};
            mealOrder.forEach(meal => {
                if (grouped[date] && grouped[date][meal]) {
                    // Sort individual scan times within each meal group (newest first)
                    sortedResult[date][meal] = grouped[date][meal].sort((a, b) => 
                        b.scannedAt.toDate() - a.scannedAt.toDate()
                    );
                }
            });
        });

        return sortedResult;
    };

    if (loading) {
        return <p>Loading live scans...</p>;
    }

    const sortedScans = groupAndSortScans(scans);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Live Scan Summary (Sorted)</h2>
                <button onClick={handleDownload} className="auth-button" style={{ marginTop: 0 }}>Download Full CSV</button>
            </div>
            
            {Object.keys(sortedScans).length === 0 ? (
                <p>No coupons have been scanned yet.</p>
            ) : (
                <div className="sorted-scans-container">
                    {Object.keys(sortedScans).map(date => (
                        <div key={date} className="scan-date-group" style={{ marginBottom: '2rem' }}>
                            <h3 className="coupon-date-header">{new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                            
                            {mealOrder.map(meal => {
                                const mealScans = sortedScans[date][meal];
                                if (!mealScans || mealScans.length === 0) return null;

                                return (
                                    <div key={meal} className="coupon-meal-group" style={{ marginBottom: '1rem' }}>
                                        <h4>{meal} ({mealScans.length} Scans)</h4>
                                        
                                        {/* 💡 Rendering as a table */}
                                        <table className="scans-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #ccc' }}>
                                                    <th style={{ width: '40%', textAlign: 'left', padding: '8px 0' }}>Attendee Name</th>
                                                    <th style={{ width: '30%', textAlign: 'left', padding: '8px 0' }}>Attendee ID</th>
                                                    <th style={{ width: '30%', textAlign: 'left', padding: '8px 0' }}>Time Scanned</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mealScans.map(scan => (
                                                    <tr key={scan.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{scan.attendeeName}</td>
                                                        <td style={{ padding: '8px 0' }}>{scan.attendeeId}</td>
                                                        <td style={{ padding: '8px 0' }}>
                                                            {scan.scannedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortedLiveScans;