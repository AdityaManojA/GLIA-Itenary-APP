import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';


const ADMIN_EMAILS = ["adityamanoja@gmail.com"];

const Header = ({ user, setCurrentPage, className }) => {

  const handleLogout = () => {
    signOut(auth);
    
  };

  return (
    
    <header className={`app-header ${className}`} style={{ position: 'relative' }}>
      
      
      {user && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem',
            textAlign: 'right' 
          }}
        >
          <button 
            onClick={handleLogout} 
            className="main-nav-button" 
            style={{ 
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              background: 'rgba(218, 241, 222, 0.1)',
              border: '1px solid transparent',
              color: '#DAF1DE',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
          
          <p style={{ margin: '0.5rem 0 0', opacity: '0.8', fontSize: '0.8rem' }}>
            
            <span>User : </span>{user.email}
          </p>
        </div>
      )}

      <h1>IAN 2025</h1>
      <p>XLIII Annual Meeting of Indian Academy of Neurosciences</p>
      <nav className="main-nav">
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('schedule')}>Schedule</button>
        
        
        {user && ADMIN_EMAILS.includes(user.email) && (
          <button onClick={() => setCurrentPage('admin')}>Admin</button>
        )}

        
        {!user && (
          <button onClick={() => setCurrentPage('auth')}>Login</button>
        )}
      </nav>
      
    </header>
  );
};

export default Header;
