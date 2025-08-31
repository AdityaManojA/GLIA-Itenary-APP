import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const AlertsAdmin = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      setFeedback('Title and message are required.');
      return;
    }
    
    setIsSending(true);
    setFeedback('');

    try {
      await addDoc(collection(db, 'notifications'), {
        title: title,
        message: message,
        createdAt: serverTimestamp()
      });
      setFeedback('✅ Alert sent successfully!');
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error("Error sending alert: ", error);
      setFeedback('❌ Failed to send alert.');
    } finally {
      setIsSending(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <div className="card glass-effect" style={{ textAlign: 'left' }}>
      <h2>Send a New Alert</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>This will send a notification to all active users.</p>
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
          <textarea
            id="alert-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., The keynote speech has been moved to Hall B."
            required
            rows="4"
            style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid rgba(142, 182, 155, 0.3)', background: 'rgba(11, 43, 38, 0.5)', color: 'var(--font-light)', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" className="auth-button" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Alert'}
        </button>
        {feedback && <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: '500' }}>{feedback}</p>}
      </form>
    </div>
  );
};

export default AlertsAdmin;
