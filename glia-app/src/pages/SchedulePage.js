import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import FullSchedule from '../components/FullSchedule';

const SchedulePage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);

    const PDF_DOWNLOAD_URL = './IAN2025schedule.pdf' 

    
    useEffect(() => {
        const q = query(collection(db, 'schedule'), orderBy('startTime'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startTime: doc.data().startTime.toDate(),
                endTime: doc.data().endTime.toDate(),
            }));
            
            setEvents(eventsData); 
            setLoading(false);
        }, (error) => {
            console.error("Error fetching schedule: ", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredEvents(events);
        } else {
            const lowerCaseSearch = searchTerm.toLowerCase();
            const results = events.filter(event => {
                
                const titleMatch = (event.title || '').toLowerCase().includes(lowerCaseSearch);
                const speakerMatch = (event.speakerName || '').toLowerCase().includes(lowerCaseSearch);
                const topicMatch = (event.speakerTopic || '').toLowerCase().includes(lowerCaseSearch);
                const chairMatch = (event.chairpersons || '').toLowerCase().includes(lowerCaseSearch);
                const venueMatch = (event.venue || '').toLowerCase().includes(lowerCaseSearch);

                return titleMatch || speakerMatch || topicMatch || chairMatch || venueMatch;
            });
            setFilteredEvents(results);
        }
    }, [events, searchTerm]);


    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const isSearching = searchTerm.length > 0;
    
    return (
        <div className="card glass-effect schedule-page-card-container"> 
            
            <div className="schedule-header-wrapper">
                <h1 style={{ textAlign: 'center' }}>Conference Schedule</h1>
                
                <a 
                    href={PDF_DOWNLOAD_URL}
                    download
                    className="download-pdf-button"
                    aria-label="Download Full Schedule as PDF"
                >
                    <span className="download-icon">↓</span> Download PDF
                </a>
            </div>
            <div className="search-bar-container" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1.5rem',
                padding: '0 1rem' 
            }}>
                <input 
                    type="text"
                    placeholder="Search titles, speakers, topics, or venue..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ 
                        flexGrow: 1, 
                        padding: '0.75rem', 
                        borderRadius: '8px 0 0 8px',
                        border: '1px solid #ccc',
                        fontSize: '1rem'
                    }}
                />
                
                {isSearching ? (
                    <button 
                        onClick={handleClearSearch}
                        className="auth-button"
                        style={{ 
                            padding: '0.75rem 1rem', 
                            borderTopLeftRadius: 0, 
                            borderBottomLeftRadius: 0,
                            backgroundColor: 'var(--text-secondary)',
                            marginTop: 0,
                            fontSize: '1rem'
                        }}
                    >
                        &times; Close
                    </button>
                ) : (
                    <div style={{ width: '6.5rem', height: 'auto', border: '1px solid transparent', borderRadius: '0 8px 8px 0' }}></div> 
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center' }}><p>Loading schedule...</p></div>
            ) : filteredEvents.length === 0 && isSearching ? (
                <p style={{ textAlign: 'center', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    No results found for "{searchTerm}".
                </p>
            ) : (
                <FullSchedule events={filteredEvents} /> 
            )}
        </div>
    );
};

export default SchedulePage;