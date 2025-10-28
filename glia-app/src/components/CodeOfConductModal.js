import React from 'react';

const CodeOfConductModal = ({ images, onClose }) => {

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-lg" onClick={(e) => e.stopPropagation()}>
                
                <button className="modal-close-btn" onClick={onClose}>
                    &times;
                </button>

                <div className="modal-image-container">
                    {images.map((image, index) => (
                        <div key={index} className="modal-image-wrapper">
                            <img
                                src={image.url} 
                                alt={image.alt}
                                className="conduct-image"
                                style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default CodeOfConductModal;