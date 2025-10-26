import React from 'react';

const AbstractPage = () => {
    return (
        <div className="card glass-effect" style={{ textAlign: 'center', padding: '3rem' }}>
            <h1 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                Abstract.
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                The full conference abstract book will be available soon. Please check back later!
            </p>
        </div>
    );
};

export default AbstractPage;