import React, { useState, useEffect } from 'react';
import './App.css'; 


import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, onSnapshot, query, orderBy, addDoc, Timestamp 
} from 'firebase/firestore';
import { 
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut 
} from 'firebase/auth';
import { 
    getStorage, ref, uploadBytes, getDownloadURL 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBc7mEMvFCS0ugnhmKZaxt1XP0Haf3spko",
  authDomain: "glia-app-a6d84.firebaseapp.com",
  projectId: "glia-app-a6d84",
  storageBucket: "glia-app-a6d84.firebasestorage.app",
  messagingSenderId: "228317645715",
  appId: "1:228317645715:web:a0e13287c76621ff27b666"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);



const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="app-header">
      <h1>GLIA</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
          <button 
            onClick={() => setCurrentPage('schedule')}
            className={currentPage === 'schedule' ? 'active' : ''}
          >
            Schedule
          </button>
          <button 
            onClick={() => setCurrentPage('admin')}
            className={currentPage === 'admin' ? 'active' : ''}
          >
            Admin
          </button>
      </nav>
    </header>
  );
};



const HappeningNow = ({ events }) => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const upcomingEvents = events.filter(event => {
    const startTime = event.startTime;
    const endTime = event.endTime;
    return (now >= startTime && now <= endTime) || (startTime > now && startTime <= oneHourFromNow);
  });

  if (upcomingEvents.length === 0) {
    return (
      <div className="card text-center">
        <p className="font-semibold">No event is currently in session or starting soon.</p>
        <p className="text-muted">Please check the full schedule.</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      {upcomingEvents.map(event => (
        <div key={event.id} className="card event-card-now">
          {event.speakerImageURL && <img src={event.speakerImageURL} alt={event.speakerName} className="speaker-image-large" />}
          <h2 className="event-title">{event.title}</h2>
          {event.speakerName && <p className="speaker-name">{event.speakerName}</p>}
          {event.designation && <p className="speaker-designation">{event.designation}</p>}
          <div className="event-detail">
            <span>📍 {event.venue}</span>
          </div>
          <div className="event-detail">
            <span>🕒 {event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const FullSchedule = ({ events }) => {
  const groupedEvents = events.reduce((acc, event) => {
    const eventDate = event.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[eventDate]) acc[eventDate] = [];
    acc[eventDate].push(event);
    return acc;
  }, {});

  if (events.length === 0) {
    return <p className="text-center text-muted">No events scheduled yet.</p>;
  }

  return (
    <div className="schedule-container">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <h3 className="schedule-date-header">{date}</h3>
          <ul className="schedule-list">
            {dateEvents.map(event => (
              <li key={event.id} className="card schedule-list-item">
                {event.speakerImageURL ? (
                  <img src={event.speakerImageURL} alt={event.speakerName} className="speaker-image-small" />
                ) : (
                  <div className="speaker-image-placeholder">
                    <span>👤</span>
                  </div>
                )}
                <div className="event-info">
                  <p className="event-title-list">{event.title}</p>
                  {event.speakerName && <p className="speaker-name-list">{event.speakerName}</p>}
                  <div className="event-details-list">
                    <span>📍 {event.venue}</span>
                    <span>🕒 {event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};



const SchedulePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'schedule'), orderBy('startTime'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      }));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching schedule: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="app-main">
      <div className="tabs-nav">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'tab-active' : ''}>Happening Now</button>
        <button onClick={() => setActiveTab('schedule')} className={activeTab === 'schedule' ? 'tab-active' : ''}>Full Schedule</button>
      </div>
      {loading ? (
        <div className="text-center"><p>Loading schedule...</p></div>
      ) : (
        <div>
          {activeTab === 'home' && <HappeningNow events={events} />}
          {activeTab === 'schedule' && <FullSchedule events={events} />}
        </div>
      )}
    </main>
  );
};

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleEventSubmit = async (eventData, imageFile) => {
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
  };

  if (loading) {
    return <div className="loading-text"><p>Loading Admin Panel...</p></div>;
  }

  return (
    <div className="admin-page">
      {!user ? (
        <LoginForm onLogin={handleLogin} error={error} />
      ) : (
        <EventForm user={user} onLogout={handleLogout} onSubmit={handleEventSubmit} />
      )}
    </div>
  );
};



const LoginForm = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-container">
      <div className="card login-form">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit">Login</button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
};

const EventForm = ({ user, onLogout, onSubmit }) => {
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
    if (file.size > 2 * 1024 * 1024) {
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
      await onSubmit(eventData, imageFile);
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
    <div className="event-form-container">
      <div className="form-header">
        <div>
          <h2>Add New Event</h2>
          <p className="text-muted">Logged in as {user.email}</p>
        </div>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
      <form onSubmit={handleSubmit} className="event-form">
        <label>Event Title</label>
        <input type="text" name="title" required />
        <label>Speaker Name</label>
        <input type="text" name="speakerName" />
        <label>Speaker's Designation (Optional)</label>
        <input type="text" name="designation" />
        <label>Speaker Image (Optional, max 2MB)</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
        {imageError && <p className="error-text">{imageError}</p>}
        <label>Venue / Hall</label>
        <input type="text" name="venue" required />
        <div className="time-inputs">
          <div>
            <label>Start Time</label>
            <input type="datetime-local" name="startTime" required />
          </div>
          <div>
            <label>End Time</label>
            <input type="datetime-local" name="endTime" required />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting || !!imageError}>
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </button>
        {feedback.message && <p className={`feedback-text ${feedback.type}`}>{feedback.message}</p>}
      </form>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [currentPage, setCurrentPage] = useState('schedule');
  return (
    <div className="app-container">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === 'schedule' && <SchedulePage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
}

export default App;
