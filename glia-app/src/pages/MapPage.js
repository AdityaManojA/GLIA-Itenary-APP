import React from 'react';

const PDF_DOWNLOAD_URL = './Shuttleroutes.pdf' 
const maps = [
{
 title: "PRE-CONFERENCE WORKSHOP VENUE", // This map should be the first one displayed
 url: "https://maps.google.com/maps?q=8.525263,76.907859&z=15&output=embed"
},
{
 title: "IAN-2025 BUS SHUTTLE ROUTES", // This title is now primarily used for the button section
 url: "https://www.google.com/maps/d/u/0/embed?mid=1QONjHLaKExHQFIcUHazgmzjnfKz6s_U&ehbc=2E312F&ll=8.499625385331845%2C77.08052227207112&z=12"
},
{
 title: "CONFERENCE VENUE (Uday Samudra Leisure Beach Hotel)",
 url: "https://maps.google.com/maps?q=8.402355,76.973196&z=15&output=embed"
}
];

const MapPage = () => {
    // We'll assume the map corresponding to the text *above* the current map is the one
    // associated with the button (IAN-2025 BUS SHUTTLE ROUTES).
    const preConferenceMap = maps[0]; 
    const busRoutesInfo = maps[1];

return (
 <div className="card glass-effect">
 <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Venue Maps</h1>

 {/* --- 1. BUS SHUTTLE ROUTES (Text + Button) --- */}
 <div 
  className="bus-shuttle-header" // New, specific wrapper for centering
  style={{ 
   display: 'flex', 
   flexDirection: 'column', 
   alignItems: 'center', 
   margin: '1rem 0 2rem 0' 
  }}
 >
       
        <h3 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>{busRoutesInfo.title}</h3>
        <br></br>
        {/* 🚨 THE BUTTON IS RE-INSERTED HERE 🚨 */}
      <a 
       href={PDF_DOWNLOAD_URL}
       download
       className="download-pdf-button-map"
       aria-label="Download Full Schedule as PDF"
       style={{ textDecoration: 'none' }} 
      >
        
          <span className="download-icon">↓</span>FULL BUS ROUTE SCHEDULE 
      </a>
 </div>

    {/* --- 2. PRE-CONFERENCE VENUE MAP (Text + Map) --- */}
    <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>{preConferenceMap.title}</h3>
    <div key={0} className="map-wrapper">
        <iframe
            src={preConferenceMap.url}
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '8px' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={preConferenceMap.title}
        ></iframe>
    </div>

 {/* --- 3. OTHER MAPS (Looping through the rest of the maps array) --- */}
 <div className="maps-container">
  {maps.slice(2).map((map, index) => (
  <div key={index} className="map-wrapper">
   <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>{map.title}</h3>
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