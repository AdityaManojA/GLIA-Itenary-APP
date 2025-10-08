import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import participants from '../data/participants.json';
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';

const AuthPage = ({ onLoginSuccess }) => {
    const [error, setError] = useState('');

    const handleLogin = async (username, password) => {
        setError('');
        const auth = getAuth();
        const usernameLower = username.toLowerCase();

        try {
            let completeUser;

            if (usernameLower === 'admin2025ian') {
                // --- ADMIN LOGIN PATH ---
                if (password !== 'Admin321') {
                    setError('Incorrect password.');
                    return;
                }
                const adminEmail = 'adityamanoja@gmail.com';
                const userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
                completeUser = {
                    reg_no: 'admin2025ian', name: 'Admin', email: adminEmail,
                    uid: userCredential.user.uid, role: 'admin' // Assign admin role
                };

            } else if (usernameLower === 'scanner2025ian') {
                // --- SCANNER LOGIN PATH ---
                if (password !== 'Scanner321') {
                    setError('Incorrect password.');
                    return;
                }
                const userCredential = await signInAnonymously(auth);
                completeUser = {
                    reg_no: 'scanner2025ian', name: 'Scanner',
                    uid: userCredential.user.uid, role: 'scanner' // Assign scanner role
                };

            } else {
                // --- REGULAR ATTENDEE LOGIN PATH ---
                const foundUser = participants.find(p => p.reg_no.toLowerCase() === usernameLower);
                if (!foundUser) {
                    setError('Invalid Attendee ID.');
                    return;
                }
                if (password !== 'IAN2025') {
                    setError('Incorrect password.');
                    return;
                }
                const userCredential = await signInAnonymously(auth);
                completeUser = { ...foundUser, uid: userCredential.user.uid, role: 'attendee' }; // Assign attendee role
            }

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