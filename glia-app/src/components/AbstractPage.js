import React from 'react';
const PDF_DOWNLOAD_URL='./abstract.pdf';
const AbstractPage = () => {
    return (
        <div className="card glass-effect" style={{ textAlign: 'center', padding: '3rem' }}>
            <h1 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                Abstract.
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                The full conference abstract book will be available soon. Please check back later!
            </p>
            <a 
       href={PDF_DOWNLOAD_URL}
       download
       className="download-pdf-button-map"
       aria-label="Download Full Schedule as PDF"
       style={{ textDecoration: 'none' }} 
      >
        
          <span className="download-icon">↓</span>Download Full Abstract 
      </a>
        </div>
    );
};

export default AbstractPage;