import React from 'react';

// The map links are now stored directly in the code
const maps = [
  {
    title: "Venue Map 1",
    // This is a custom "My Maps" URL
    url: "https://www.google.com/maps/d/embed?mid=195fYKK-5nyiBckRT4LGH80eqdt2a-rY"
  },
  {
    title: "Venue Map 2",
    // This is a standard Google Maps URL converted to an embeddable format
    url: "https://maps.google.com/maps?q=8.402355,76.973196&z=15&output=embed"
  },
  {
    title: "Venue Map 3",
    url: "https://maps.google.com/maps?q=8.525263,76.907859&z=15&output=embed"
  }
];

const MapPage = () => {
  return (
    <div className="card glass-effect">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Venue Maps</h1>
      <div className="maps-container">
        {maps.map((map, index) => (
          <div key={index} className="map-wrapper">
            <h2>{map.title}</h2>
            <iframe
              src={map.url}
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={map.title}
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPage;

