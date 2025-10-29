import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';


// Define custom order arrays outside the component
const mealOrder = ["Lunch", "Dinner"]; // 'Breakfast' REMOVED
const dateOrder = ["2025-10-29", "2025-10-30", "2025-10-31", "2025-11-01"];
const dateOptions = dateOrder.map(date => ({ 
    value: date, 
    label: new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
}));


// Helper function to sort dates based on the custom order array
const sortDates = (dateA, dateB) => {
    const indexA = dateOrder.indexOf(dateA);
    const indexB = dateOrder.indexOf(dateB);
    if (indexA === -1 || indexB === -1) return 0; // Fallback
    return indexA - indexB;
};

// FUNCTION: Filter out duplicates based on the three criteria (Attendee ID, Meal, Date)
const filterDuplicates = (scans) => {
    const uniqueScans = new Map();
    
    // Sort scans by 'scannedAt' descending (newest first)
    const sortedScans = scans.sort((a, b) => b.scannedAt.toDate() - a.scannedAt.toDate());

    sortedScans.forEach(scan => {
        const key = `${scan.attendeeId}|${scan.meal}|${scan.date}`;
        
        // Since the array is sorted newest first, we only keep the first entry found for the key
        if (!uniqueScans.has(key)) {
            uniqueScans.set(key, scan);
        }
    });

    return Array.from(uniqueScans.values());
};


const SortedLiveScans = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    // NEW FILTER STATES: Initialized to the first available options
    const [selectedDate, setSelectedDate] = useState(dateOrder[0]);
    const [selectedMeal, setSelectedMeal] = useState(mealOrder[0]);

    // Use useMemo to filter and memoize the unique scans based on filter criteria
    const uniqueFilteredScans = useMemo(() => {
        // Step 1: Filter for unique entries across all data
        const uniqueScans = filterDuplicates(scans);

        // Step 2: Apply Date and Meal filters
        return uniqueScans.filter(scan => 
            scan.date === selectedDate && scan.meal === selectedMeal
        );
    }, [scans, selectedDate, selectedMeal]);


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
        const dataToDownload = uniqueFilteredScans;
        
        if (dataToDownload.length === 0) {
            alert("There is no data to download.");
            return;
        }

        const headers = ["Attendee ID", "Attendee Name", "Meal", "Date", "Scanned At"];
        const csvRows = [headers.join(',')];

        // Format data into CSV rows
        dataToDownload.forEach(scan => {
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
        
        // Use BOM ('\ufeff') and standard CSV MIME type
        const blob = new Blob(['\ufeff', csvString], { type: 'text/csv;charset=utf-8;' });
        
        // Trigger download
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `unique-scans-${selectedDate}-${selectedMeal}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // This grouping function is now simplified since uniqueFilteredScans already contains only one date/meal type
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

    const sortedScans = groupAndSortScans(uniqueFilteredScans);

    return (
        <div style={{ padding: '1rem' }}>
            {/* --- Filtering Dropdowns --- */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {/* Date Dropdown */}
                <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label htmlFor="scan-date-filter" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Filter by Date</label>
                    <select 
                        id="scan-date-filter" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                    >
                        {dateOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                
                {/* Meal Dropdown */}
                <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
                    <label htmlFor="meal-filter" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Filter by Meal</label>
                    <select 
                        id="meal-filter" 
                        value={selectedMeal} 
                        onChange={(e) => setSelectedMeal(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px' }}
                    >
                        {mealOrder.map(meal => (
                            <option key={meal} value={meal}>{meal}</option>
                        ))}
                    </select>
                </div>
            </div>


            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Live Scan Summary</h2>
                
                
                <div>
                    <button onClick={handleDownload} className="auth-button" style={{ marginTop: 0 }}>
                        Download as CSV
                    </button>
                </div>
            </div>
            
            {Object.keys(sortedScans).length === 0 ? (
                <p>No unique coupons have been scanned yet for {selectedMeal} on {new Date(selectedDate).toLocaleDateString()}.</p>
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