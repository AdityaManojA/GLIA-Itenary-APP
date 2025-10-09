import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// EventDisplayCard (No changes needed here, keeping the original code)
const EventDisplayCard = ({ event }) => { 
    if (!event) {
        return (
            <div className="live-display-card">
                <p className="no-event-message">No event currently scheduled for this hall.</p>
            </div>
        );
    }

    const startTime = event.startTime?.toDate ? event.startTime.toDate() : event.startTime;
    const endTime = event.endTime?.toDate ? event.endTime.toDate() : event.endTime;

    return (
        <div className="live-display-card">
            <div className="live-display-main-content">
                {event.speakerImageURL && (
                    <img src={event.speakerImageURL} alt={event.speakerName} className="live-display-speaker-image" />
                )}
                <h3 className="live-display-title">{event.title}</h3>
                {event.speakerName && <p className="live-display-speaker">{event.speakerName}</p>}
                {event.speakerTopic && <p className="live-display-topic">{event.speakerTopic}</p>}
                {startTime && endTime && (
                    <p className="live-display-time">
                        🕒 {startTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
                {event.chairpersons && (
                    <div className="live-display-chairs">
                        <strong>Chairperson(s):</strong> {event.chairpersons}
                    </div>
                )}
            </div>
        </div>
    );
};


// HappeningNow component with structured layout logic
const HappeningNow = () => {
    const [hall1Event, setHall1Event] = useState(null);
    const [hall2Event, setHall2Event] = useState(null);
    const [posterV1Event, setPosterV1Event] = useState(null); 
    const [posterV2Event, setPosterV2Event] = useState(null); 
    const [lunchEvent, setLunchEvent] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeHall1Auto = null;
        let unsubscribeHall2Auto = null;
        let unsubscribePosterV1Auto = null;
        let unsubscribePosterV2Auto = null;
        let unsubscribeLunchAuto = null;
        
        const overrideDocRef = doc(db, 'live_display', 'override');
        const scheduleColRef = collection(db, 'schedule');

        const fetchEventById = async (eventId) => {
            if (!eventId) return null;
            const eventDoc = await getDoc(doc(db, 'schedule', eventId));
            return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null;
        };

        const fetchLiveEventForHall = (hallName, callback) => {
            const now = new Date();
            const q = query(
                scheduleColRef,
                where('venue', '==', hallName),
                where('startTime', '<=', now),
                orderBy('startTime', 'desc') 
            );

            return onSnapshot(q, (snapshot) => {
                const startedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const liveEvent = startedEvents.find(event => event.endTime.toDate() >= now);
                callback(liveEvent || null);
            });
        };

        const unsubscribeOverride = onSnapshot(overrideDocRef, async (docSnap) => {
            const overrideData = docSnap.exists() ? docSnap.data() : {};
            
            // Hall 1 Logic
            if (unsubscribeHall1Auto) unsubscribeHall1Auto();
            if (overrideData.hall1) {
                const event = await fetchEventById(overrideData.hall1);
                setHall1Event(event);
            } else {
                unsubscribeHall1Auto = fetchLiveEventForHall('HALL 1', setHall1Event);
            }

            // Hall 2 Logic
            if (unsubscribeHall2Auto) unsubscribeHall2Auto();
            if (overrideData.hall2) {
                const event = await fetchEventById(overrideData.hall2);
                setHall2Event(event);
            } else {
                unsubscribeHall2Auto = fetchLiveEventForHall('HALL 2', setHall2Event);
            }
            
            // POSTER V1 Logic (No override needed for posters/lunch as per typical use case)
            if (unsubscribePosterV1Auto) unsubscribePosterV1Auto();
            unsubscribePosterV1Auto = fetchLiveEventForHall('POSTER V1', setPosterV1Event);
            
            // POSTER V2 Logic
            if (unsubscribePosterV2Auto) unsubscribePosterV2Auto();
            unsubscribePosterV2Auto = fetchLiveEventForHall('POSTER V2', setPosterV2Event);

            // LUNCH Logic
            if (unsubscribeLunchAuto) unsubscribeLunchAuto();
            unsubscribeLunchAuto = fetchLiveEventForHall('LUNCH', setLunchEvent);

            setLoading(false);
        });

        return () => {
            unsubscribeOverride();
            if (unsubscribeHall1Auto) unsubscribeHall1Auto();
            if (unsubscribeHall2Auto) unsubscribeHall2Auto();
            if (unsubscribePosterV1Auto) unsubscribePosterV1Auto();
            if (unsubscribePosterV2Auto) unsubscribePosterV2Auto();
            if (unsubscribeLunchAuto) unsubscribeLunchAuto();
        };
    }, []);

    if (loading) {
        return (
            <div className="card glass-effect">
                <h2 style={{ textAlign: 'center' }}>Happening Now</h2>
                <p style={{ textAlign: 'center' }}>Loading live schedule...</p>
            </div>
        );
    }
    
    // Determine which events are live
    const hasHall1Event = hall1Event !== null;
    const hasHall2Event = hall2Event !== null;
    const hasPosterV1Event = posterV1Event !== null;
    const hasPosterV2Event = posterV2Event !== null;
    const hasLunchEvent = lunchEvent !== null;

    const isRow1Active = hasHall1Event || hasHall2Event;
    const isRow2Active = hasPosterV1Event || hasPosterV2Event;
    const isRow3Active = hasLunchEvent;

    const totalActiveRows = (isRow1Active ? 1 : 0) + (isRow2Active ? 1 : 0) + (isRow3Active ? 1 : 0);

    return (
        <div className="card glass-effect">
            <h2 style={{ textAlign: 'center' }}>Happening Now</h2>
            
            <div className="live-display-container-wrapper">
                {totalActiveRows === 0 && (
                    <p style={{ textAlign: 'center', width: '100%', padding: '20px' }}>
                        Nothing is currently scheduled or live.
                    </p>
                )}

                {/* ROW 1: HALL 1 and HALL 2 */}
                {isRow1Active && (
                    <div className="live-display-row two-column-row">
                        {/* HALL 1 */}
                        <div className="live-display-column">
                            <h3>HALL 1</h3>
                            <EventDisplayCard event={hall1Event} /> 
                        </div>

                        {/* HALL 2 */}
                        <div className="live-display-column">
                            <h3>HALL 2</h3>
                            <EventDisplayCard event={hall2Event} /> 
                        </div>
                    </div>
                )}

                {/* ROW 2: POSTER V1 and POSTER V2 */}
                {isRow2Active && (
                    <div className="live-display-row two-column-row">
                        {/* POSTER V1 */}
                        {hasPosterV1Event && (
                            <div className="live-display-column">
                                <h3>POSTER V1</h3>
                                <EventDisplayCard event={posterV1Event} /> 
                            </div>
                        )}

                        {/* POSTER V2 */}
                        {hasPosterV2Event && (
                            <div className="live-display-column">
                                <h3>POSTER V2</h3>
                                <EventDisplayCard event={posterV2Event} /> 
                            </div>
                        )}
                        
                        {/* Placeholder to ensure two columns wide even if only one poster is active */}
                        {(hasPosterV1Event && !hasPosterV2Event) || (!hasPosterV1Event && hasPosterV2Event) ? (
                            <div className="live-display-column-placeholder"></div>
                        ) : null}
                    </div>
                )}

                {/* ROW 3: LUNCH */}
                {isRow3Active && (
                    <div className="live-display-row single-column-row">
                        <div className="live-display-column">
                            <h3>LUNCH</h3>
                            <EventDisplayCard event={lunchEvent} /> 
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HappeningNow;