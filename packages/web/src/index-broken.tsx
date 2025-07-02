import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './pages/index';
import './styles/index.css';

console.log('🚀 EchoPages Journal loading...');

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in index.html');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);

console.log('✅ EchoPages Journal app mounted successfully!');
