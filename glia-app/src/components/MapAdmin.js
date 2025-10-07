import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const MapAdmin = () => {
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapUrl = async () => {
      const mapDocRef = doc(db, 'site_content', 'map');
      const docSnap = await getDoc(mapDocRef);
      if (docSnap.exists()) {
        const url = docSnap.data().url;
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

  if (loading) {
    return <p>Loading map preview...</p>;
  }

  return (
    <div>
      <h2>Live Map Preview</h2>
      <p style={{ opacity: 0.8, marginTop: 0, color: 'var(--text-secondary)' }}>
        This is the map currently displayed on your site. To update it, please edit the URL directly in your Firestore database under `site_content/map`.
      </p>
      {mapUrl ? (
        <div className="map-container" style={{ marginTop: '1rem' }}>
          <iframe
            src={mapUrl}
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '8px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Venue Map Preview"
          ></iframe>
        </div>
      ) : (
        <p>No map URL has been set in the database yet.</p>
      )}
    </div>
  );
};

export default MapAdmin;

