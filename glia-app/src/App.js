import React, { useState, useEffect } from 'react';

// --- Firebase Configuration ---
// In a real app, this would be in a file like `src/firebase.js`
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

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);


// --- Reusable UI Components ---

const Header = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="bg-indigo-600 text-white p-6 text-center shadow-lg">
      <h1 className="text-3xl font-bold">GLIA</h1>
      <p className="text-indigo-200 mt-1">XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="mt-4 space-x-4">
          <button 
            onClick={() => setCurrentPage('schedule')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 'schedule' ? 'bg-white text-indigo-600' : 'text-indigo-200 hover:bg-indigo-700'}`}
          >
            Schedule
          </button>
          <button 
            onClick={() => setCurrentPage('admin')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 'admin' ? 'bg-white text-indigo-600' : 'text-indigo-200 hover:bg-indigo-700'}`}
          >
            Admin
          </button>
      </nav>
    </header>
  );
};

// --- Data Display Components (From Step 2) ---

const HappeningNow = ({ events }) => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const upcomingEvents = events.filter(event => {
    const startTime = event.startTime;
    const endTime = event.endTime;
    return (now >= startTime && now <= endTime) || (startTime > now && startTime <= oneHourFromNow);
  });
  if (upcomingEvents.length === 0) return <div className="bg-white border border-gray-200 rounded-lg p-6 text-center"><p className="text-lg font-semibold">No event is currently in session or starting soon.</p><p className="text-gray-500 mt-1">Please check the full schedule.</p></div>;
  return <div className="space-y-6">{upcomingEvents.map(event => <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">{event.speakerImageURL && <img src={event.speakerImageURL} alt={event.speakerName} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-200 shadow-lg" />}<h2 className="text-2xl font-bold text-indigo-600 mb-2">{event.title}</h2>{event.speakerName && <p className="text-xl font-semibold">{event.speakerName}</p>}{event.designation && <p className="text-md text-gray-500 mb-4">{event.designation}</p>}<div className="flex items-center justify-center text-gray-600 mt-4"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>{event.venue}</span></div><div className="flex items-center justify-center text-gray-600 mt-2"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>{event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div></div>)}</div>;
};

const FullSchedule = ({ events }) => {
  const groupedEvents = events.reduce((acc, event) => { const eventDate = event.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); if (!acc[eventDate]) acc[eventDate] = []; acc[eventDate].push(event); return acc; }, {});
  if (events.length === 0) return <p className="text-center text-gray-500">No events scheduled yet.</p>;
  return <div className="space-y-8">{Object.entries(groupedEvents).map(([date, dateEvents]) => <div key={date}><h3 className="text-xl font-bold border-b-2 border-indigo-500 pb-2 mb-4">{date}</h3><ul className="space-y-4">{dateEvents.map(event => <li key={event.id} className="bg-gray-50 p-4 rounded-lg border flex items-center">{event.speakerImageURL ? <img src={event.speakerImageURL} alt={event.speakerName} className="w-16 h-16 rounded-full object-cover mr-4" /> : <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-gray-400"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>}<div className="flex-grow"><p className="font-bold text-lg text-indigo-700">{event.title}</p>{event.speakerName && <p className="font-semibold">{event.speakerName}</p>}<div className="text-sm text-gray-500 mt-2"><span className="inline-flex items-center">📍<span className="ml-1">{event.venue}</span></span><span className="inline-flex items-center ml-4">🕒<span className="ml-1">{event.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></span></div></div></li>)}</ul></div>)}</div>;
};


// --- Page Components ---

const SchedulePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const q = query(collection(db, 'schedule'), orderBy('startTime')); const unsubscribe = onSnapshot(q, (snapshot) => { const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), startTime: doc.data().startTime.toDate(), endTime: doc.data().endTime.toDate(), })); setEvents(eventsData); setLoading(false); }, (error) => { console.error("Error fetching schedule: ", error); setLoading(false); }); return () => unsubscribe(); }, []);
  const TabButton = ({ id, title }) => (<button onClick={() => setActiveTab(id)} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{title}</button>);
  return <main className="p-4 sm:p-6 lg:p-8"><div className="border-b border-gray-200 mb-6"><nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs"><TabButton id="home" title="Happening Now" /><TabButton id="schedule" title="Full Schedule" /></nav></div>{loading ? <div className="text-center py-10"><p className="text-gray-500">Loading schedule...</p></div> : <div>{activeTab === 'home' && <HappeningNow events={events} />}{activeTab === 'schedule' && <FullSchedule events={events} />}</div>}</main>;
};

const AdminPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe(); // Cleanup on unmount
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
        return <div className="p-8 text-center"><p>Loading Admin Panel...</p></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {!user ? (
                <LoginForm onLogin={handleLogin} error={error} />
            ) : (
                <EventForm user={user} onLogout={handleLogout} onSubmit={handleEventSubmit} />
            )}
        </div>
    );
};

// --- Admin Sub-Components ---

const LoginForm = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="max-w-sm mx-auto my-10">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Login</button>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
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
        // Simple validation, can be enhanced
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
        <div className="max-w-xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Event</h1>
                    <p className="text-sm text-gray-500">Logged in as {user.email}</p>
                </div>
                <button onClick={onLogout} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Logout</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label htmlFor="title" className="block font-medium text-sm text-gray-700">Event Title</label><input type="text" name="title" id="title" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                <div><label htmlFor="speakerName" className="block font-medium text-sm text-gray-700">Speaker Name</label><input type="text" name="speakerName" id="speakerName" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                <div><label htmlFor="designation" className="block font-medium text-sm text-gray-700">Speaker's Designation (Optional)</label><input type="text" name="designation" id="designation" className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                <div><label htmlFor="speakerImage" className="block font-medium text-sm text-gray-700">Speaker Image (Optional, max 2MB)</label><input type="file" id="speakerImage" accept="image/*" onChange={handleImageChange} className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />{imagePreview && <img src={imagePreview} alt="Image preview" className="mt-2 rounded-md max-h-40" />}{imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}</div>
                <div><label htmlFor="venue" className="block font-medium text-sm text-gray-700">Venue / Hall</label><input type="text" name="venue" id="venue" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="startTime" className="block font-medium text-sm text-gray-700">Start Time</label><input type="datetime-local" name="startTime" id="startTime" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                    <div><label htmlFor="endTime" className="block font-medium text-sm text-gray-700">End Time</label><input type="datetime-local" name="endTime" id="endTime" required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" /></div>
                </div>
                <button type="submit" disabled={isSubmitting || !!imageError} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400">{isSubmitting ? 'Saving...' : 'Save Event'}</button>
                {feedback.message && <p className={`mt-4 text-center font-medium ${feedback.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{feedback.message}</p>}
            </form>
        </div>
    );
};


// --- Main App Component ---

function App() {
  const [currentPage, setCurrentPage] = useState('schedule'); // 'schedule' or 'admin'

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-lg font-sans">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {currentPage === 'schedule' && <SchedulePage />}
      {currentPage === 'admin' && <AdminPage />}
    </div>
  );
}

export default App;
