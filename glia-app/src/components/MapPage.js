import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const MapPage = () => {
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapUrl = async () => {
      const mapDocRef = doc(db, 'site_content', 'map');
      const docSnap = await getDoc(mapDocRef);
      if (docSnap.exists()) {
        const url = docSnap.data().url;
        // Extract the src from the iframe tag
        const srcRegex = /src="([^"]+)"/;
        const match = url.match(srcRegex);
        if (match && match[1]) {
          setMapUrl(match[1]);
        }
      }
      setLoading(false);
    };
    fetchMapUrl();
  }, []);

  return (
    <div className="card glass-effect">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Venue Map</h1>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading map...</p>
      ) : mapUrl ? (
        <div className="map-container">
          <iframe
            src={mapUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Map"
          ></iframe>
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>The map has not been configured yet.</p>
      )}
    </div>
  );
};

export default MapPage;
