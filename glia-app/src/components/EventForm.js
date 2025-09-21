import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';


const EventForm = ({ currentEvent, onDone }) => {
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [title, setTitle] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    const hours = (`0${d.getHours()}`).slice(-2);
    const minutes = (`0${d.getMinutes()}`).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  
  useEffect(() => {
    if (currentEvent) {
      setTitle(currentEvent.title || '');
      setSpeakerName(currentEvent.speakerName || '');
      setDesignation(currentEvent.designation || '');
      setVenue(currentEvent.venue || '');
      setStartTime(formatDateForInput(currentEvent.startTime));
      setEndTime(formatDateForInput(currentEvent.endTime));
      setImagePreview(currentEvent.speakerImageURL || '');
      setImageFile(null); 
    } else {
      
      setTitle('');
      setSpeakerName('');
      setDesignation('');
      setVenue('');
      setStartTime('');
      setEndTime('');
      setImagePreview('');
      setImageFile(null);
    }
  }, [currentEvent]);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(currentEvent ? currentEvent.speakerImageURL : ''); 
      setImageError('');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit in image 
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
  
    const eventDataPayload = {
        title,
        speakerName,
        designation,
        venue,
        startTime: Timestamp.fromDate(new Date(startTime)),
        endTime: Timestamp.fromDate(new Date(endTime)),
    };
  
    try {
      let speakerImageURL = currentEvent?.speakerImageURL || '';
      if (imageFile) {
        const imageRef = ref(storage, `speaker_images/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        speakerImageURL = await getDownloadURL(snapshot.ref);
      }
      eventDataPayload.speakerImageURL = speakerImageURL;

      if (currentEvent) {
        
        const eventDocRef = doc(db, 'schedule', currentEvent.id);
        await updateDoc(eventDocRef, eventDataPayload);
        setFeedback({ message: '✅ Event updated successfully!', type: 'success' });
      } else {
        
        await addDoc(collection(db, 'schedule'), eventDataPayload);
        setFeedback({ message: '✅ Event saved successfully!', type: 'success' });
        
        e.target.reset();
        setImagePreview('');
        setImageFile(null);
      }

    } catch (error) {
      console.error("Error saving event: ", error);
      setFeedback({ message: `❌ Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
      onDone(); 
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
    }
  };

  return (
    <div className="card glass-effect" style={{ textAlign: 'left' }}>
      
      <h2>{currentEvent ? 'Edit Conference Event' : 'Add New Conference Event'}</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        {currentEvent ? 'Update the details below.' : 'Fill out the details below to add a new item to the schedule.'}
      </p>
      <form onSubmit={handleSubmit} className="event-form">
        
        <div className="input-group">
          <label htmlFor="title">Event Title</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="input-group">
          <label htmlFor="speakerName">Speaker Name (Optional)</label>
          <input id="speakerName" type="text" value={speakerName} onChange={e => setSpeakerName(e.target.value)} />
        </div>
        
        <div className="input-group">
          <label htmlFor="designation">Speaker's Designation (Optional)</label>
          <input id="designation" type="text" value={designation} onChange={e => setDesignation(e.target.value)} />
        </div>

        <div className="input-group">
          <label htmlFor="speakerImage">Speaker Image (Optional, max 2MB)</label>
          <input id="speakerImage" type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxHeight: '100px', marginTop: '10px', borderRadius: '8px' }} />}
          {imageError && <p className="error-text" style={{ color: '#ff9a9a' }}>{imageError}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="venue">Venue / Hall</label>
          <input id="venue" type="text" value={venue} onChange={e => setVenue(e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="startTime">Start Time</label>
            <input id="startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="endTime">End Time</label>
            <input id="endTime" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
        </div>
        

        <div className="event-actions" style={{ justifyContent: 'center' }}>
            {currentEvent && (
                <button type="button" className="delete-btn" onClick={onDone} style={{backgroundColor: '#555'}}>
                    Cancel
                </button>
            )}
            <button type="submit" className="auth-button" disabled={isSubmitting || !!imageError}>
                {isSubmitting ? 'Saving...' : (currentEvent ? 'Save Changes' : 'Save Event')}
            </button>
        </div>
        
        {feedback.message && <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: '500' }}>{feedback.message}</p>}
      </form>
    </div>
  );
};

export default EventForm;