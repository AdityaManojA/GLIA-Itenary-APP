// src/pages/CodeAndConductPage.js

import React from 'react';

const CodeAndConductPage = () => {
    return (
        <div className="card glass-effect">
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Code and Conduct</h1>
            
            <p>Welcome to the IAN 2025 Conference. We are dedicated to providing a harassment-free conference experience for everyone, regardless of gender, gender identity and expression, age, sexual orientation, disability, physical appearance, body size, race, ethnicity, religion (or lack thereof), or technology choices.</p>
            
            <h3 style={{ marginTop: '2rem' }}>Expected Behavior</h3>
            <ul>
                <li>Be considerate, respectful, and collaborative.</li>
                <li>Refrain from demeaning, discriminatory, or harassing behavior and speech.</li>
                <li>Be mindful of your surroundings and of your fellow participants.</li>
            </ul>
            
            <h3 style={{ marginTop: '2rem' }}>Unacceptable Behavior</h3>
            <p>Unacceptable behaviors include offensive comments, verbal harassment, intimidation, stalking, unwelcome physical contact, and unwelcome sexual attention.</p>
            <p style={{ marginTop: '1rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>Participants asked to stop any harassing behavior are expected to comply immediately.</p>
        </div>
    );
};

export default CodeAndConductPage;