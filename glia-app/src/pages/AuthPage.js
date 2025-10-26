    import React, { useState } from 'react';
    import LoginForm from '../components/LoginForm';
    import participants from '../data/participants.json';
    import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth'; 

    // 💡 HARDCODE A STATIC UID FOR ALL ATTENDEES (Keep this)
    const ATTENDEE_UID = 'SHARED_ATTENDEE_SESSION'; 
    // 💡 HARDCODE A STATIC UID FOR THE SCANNER (New)
    const SCANNER_UID = 'DEDICATED_SCANNER_SESSION'; 

    const AuthPage = ({ onLoginSuccess }) => {
        const [error, setError] = useState('');

        const handleLogin = async (username, password) => {
            setError('');
            const auth = getAuth();
            const usernameLower = username.toLowerCase();

            try {
                // Ensure any previous session (including Scanner/Admin) is cleared
                if (auth.currentUser) {
                    await signOut(auth);
                }
                
                let completeUser;
                let userCredential;

                if (usernameLower === 'admin2025ian') {
                    // --- ADMIN LOGIN PATH (Unique UID) ---
                    if (password !== 'Admin321') {
                        setError('Incorrect password.');
                        return;
                    }
                    const adminEmail = 'adityamanoja@gmail.com';
                    userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
                    completeUser = {
                        reg_no: 'admin2025ian', name: 'Admin', email: adminEmail,
                        uid: userCredential.user.uid, role: 'admin'
                    };

                } else if (usernameLower === 'scanner2025ian') {
                    // --- SCANNER LOGIN PATH (Static UID) ---
                    if (password !== 'Scanner321') {
                        setError('Incorrect password.');
                        return;
                    }
                    // Sign in anonymously to establish a session
                    userCredential = await signInAnonymously(auth); 
                    
                    // Overwrite the UID with the hardcoded static SCANNER UID
                    completeUser = {
                        reg_no: 'scanner2025ian', name: 'Scanner',
                        uid: SCANNER_UID, // <-- FORCED STATIC SCANNER UID
                        role: 'scanner',
                        email: '[Dedicated Scanner Session]' 
                    };

                } else {
                    // --- REGULAR ATTENDEE LOGIN PATH (Shared UID) ---
                    const foundUser = participants.find(p => p.reg_no.toLowerCase() === usernameLower);
                    if (!foundUser) {
                        setError('Invalid Attendee ID.');
                        return;
                    }
                    if (password !== 'IAN2025') {
                        setError('Incorrect password.');
                        return;
                    }

                    // Sign in anonymously to establish a session
                    userCredential = await signInAnonymously(auth); 
                    
                    // Overwrite the UID with the hardcoded static ATTENDEE UID
                    completeUser = { 
                        ...foundUser, 
                        uid: ATTENDEE_UID, // <-- FORCED STATIC ATTENDEE UID
                        role: 'attendee',
                        email: '[Shared Attendee Session]'
                    };
                }
                
                // LOGGING USER DETAILS TO CONSOLE
                console.group(`Login Successful: ${completeUser.name} (${completeUser.role.toUpperCase()})`);
                console.log("🔥 Firebase UID:", completeUser.uid); 
                console.log("👤 User Role:", completeUser.role);
                console.log("✉️ Identifier:", completeUser.email);
                console.log("Complete User Object:", completeUser);
                console.groupEnd();

                onLoginSuccess(completeUser);

            } catch (authError) {
                console.error("Firebase sign-in failed:", authError);
                setError("Could not create a secure session. Please check your network or try again.");
            }
        };

        return (
            <div className="auth-form-container">
                <LoginForm 
                    onLogin={handleLogin} 
                    error={error} 
                />
            </div>
        );
    };

    export default AuthPage;