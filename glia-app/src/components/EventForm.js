import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const EventForm = () => {
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      setImageError('');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setImageError('File is too large. Max 2MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ message: '', type: '' });
    const formData = new FormData(e.target);
    const eventData = Object.fromEntries(formData.entries());

    try {
      let speakerImageURL = '';
      if (imageFile) {
        const imageRef = ref(storage, `speaker_images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        speakerImageURL = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'schedule'), {
        ...eventData,
        speakerImageURL,
        startTime: Timestamp.fromDate(new Date(eventData.startTime)),
        endTime: Timestamp.fromDate(new Date(eventData.endTime)),
      });

      setFeedback({ message: '✅ Event saved successfully!', type: 'success' });
      e.target.reset();
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error("Error saving event: ", error);
      setFeedback({ message: `❌ Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
    }
  };

  return (
    <div className="card glass-effect" style={{ textAlign: 'left' }}>
      <h2>Add New Conference Event</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Fill out the details below to add a new item to the schedule.</p>
      <form onSubmit={handleSubmit} className="event-form">
        
        <div className="input-group">
          <label htmlFor="title">Event Title</label>
          <input id="title" type="text" name="title" required />
        </div>

        <div className="input-group">
          <label htmlFor="speakerName">Speaker Name (Optional)</label>
          <input id="speakerName" type="text" name="speakerName" />
        </div>
        
        <div className="input-group">
          <label htmlFor="designation">Speaker's Designation (Optional)</label>
          <input id="designation" type="text" name="designation" />
        </div>

        <div className="input-group">
          <label htmlFor="speakerImage">Speaker Image (Optional, max 2MB)</label>
          <input id="speakerImage" type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxHeight: '100px', marginTop: '10px', borderRadius: '8px' }} />}
          {imageError && <p className="error-text" style={{ color: '#ff9a9a' }}>{imageError}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="venue">Venue / Hall</label>
          <input id="venue" type="text" name="venue" required />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="startTime">Start Time</label>
            <input id="startTime" type="datetime-local" name="startTime" required />
          </div>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="endTime">End Time</label>
            <input id="endTime" type="datetime-local" name="endTime" required />
          </div>
        </div>
        
        <button type="submit" className="auth-button" disabled={isSubmitting || !!imageError}>
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
        
        {feedback.message && <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: '500' }}>{feedback.message}</p>}
      </form>
    </div>
  );
};

export default EventForm;
