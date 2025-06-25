import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { EditorPage } from './EditorPage';
import { EntriesPage } from './EntriesPage';
import { CalendarPageWorking } from './CalendarPageWorking';
import { AuthCallbackPage } from './AuthCallbackPage';
import { useAuth } from '../context/AuthContext';
import { getJWT } from '../services/authService';

const AppRouter: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { jwt } = useAuth();

  useEffect(() => {
    // Check if user has a valid JWT on app load
    const checkAuth = () => {
      const token = jwt || getJWT();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = Date.now() >= payload.exp * 1000;
          if (!isExpired) {
            setAuthenticated(true);
            return;
          }
        } catch (e) {
          console.error('Invalid JWT:', e);
        }
      }
      setAuthenticated(false);
    };

    checkAuth();
    setLoading(false);
  }, [jwt]); // React to JWT changes from auth context

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>🎯 EchoPages Journal</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/editor"
          element={authenticated ? <EditorPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/entries"
          element={authenticated ? <EntriesPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/calendar"
          element={authenticated ? <CalendarPageWorking /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={
            !authenticated ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/entries" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
