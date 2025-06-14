import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { EditorPage } from './EditorPage';

const AppRouter: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);

  // Simulate login success
  const handleLoginSuccess = () => setAuthenticated(true);

  if (!authenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  return <EditorPage />;
};

export default AppRouter; 