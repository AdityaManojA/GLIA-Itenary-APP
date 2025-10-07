import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const AlertsAdmin = ({ currentAlert, onDone }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (currentAlert) {
      setTitle(currentAlert.title || '');
      setMessage(currentAlert.message || '');
    } else {
      setTitle('');
      setMessage('');
    }
  }, [currentAlert]);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      setFeedback('Title and message are required.');
      return;
    }
    
    setIsSending(true);
    setFeedback('');

    const alertPayload = {
        title: title,
        message: message,
    };

    try {
        if (currentAlert) {
            const alertDocRef = doc(db, 'notifications', currentAlert.id);
            await updateDoc(alertDocRef, alertPayload);
            setFeedback('✅ Alert updated successfully!');
        } else {
            alertPayload.createdAt = serverTimestamp();
            await addDoc(collection(db, 'notifications'), alertPayload);
            setFeedback('✅ Alert sent successfully!');
            setTitle('');
            setMessage('');
        }
    } catch (error) {
        console.error("Error sending/updating alert: ", error);
        setFeedback(`❌ Failed to ${currentAlert ? 'update' : 'send'} alert.`);
    } finally {
        setIsSending(false);
        if (onDone) onDone();
        setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>{currentAlert ? 'Edit Alert' : 'Send a New Alert'}</h2>
      <p style={{ opacity: 0.8, marginTop: 0, color: 'var(--text-secondary)' }}>
        {currentAlert ? 'Update the title and message below.' : 'This will send a notification to all active users.'}
      </p>
      <form onSubmit={handleSendAlert} className="event-form">
        <div className="input-group">
          <label htmlFor="alert-title">Notification Title</label>
          <input
            id="alert-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Schedule Change"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="alert-message">Notification Message</label>
          {/* The inline style has been removed from the textarea below */}
          <textarea
            id="alert-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., The keynote speech has been moved to Hall B."
            required
            rows="4"
          />
        </div>
        <div className="event-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            {currentAlert && (
                <button type="button" className="delete-btn" onClick={onDone} style={{backgroundColor: '#6c757d'}}>
                    Cancel
                </button>
            )}
            <button type="submit" className="auth-button" disabled={isSending}>
                {isSending ? 'Saving...' : (currentAlert ? 'Save Changes' : 'Send Alert')}
            </button>
        </div>
        {feedback && <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: '500' }}>{feedback}</p>}
      </form>
    </div>
  );
};

export default AlertsAdmin;

