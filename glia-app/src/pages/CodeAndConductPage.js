// src/pages/CodeAndConductPage.js

import React, { useState } from 'react';
import CodeOfConductModal from '../components/CodeOfConductModal';

// Define the file names for the two pages
const CODE_OF_CONDUCT_IMAGES = [
  { 
    url: '/Code of conduct_pg1.jpg',
    alt: 'Code of Conduct Page 1' 
  },
  { 
    url: '/Code of conduct_pg2.jpg',
    alt: 'Code of Conduct Page 2' 
  }
];

const CodeAndConductPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* The main page content is blurred when the modal is open */}
      <div className={`card glass-effect ${isModalOpen ? 'blurred-content' : ''}`}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Code of Conduct</h1>
        
        <p style={{ textAlign: 'center', margin: '2rem 0' }}>

          <button 
            onClick={openModal} 
            className="auth-button"
            style={{ maxWidth: '300px', display: 'block', margin: '1rem auto' }}
          >
            View Full Code of Conduct
          </button>
        </p>

        <p style={{ textAlign: 'center', opacity: 0.8 }}>
          Click the button above to view the full, official document.
        </p>
        
      </div>

      {/* Modal remains separate and conditional */}
      {isModalOpen && (
        <CodeOfConductModal 
          images={CODE_OF_CONDUCT_IMAGES} 
          onClose={closeModal} 
        />
      )}
    </>
  );
};

export default CodeAndConductPage;