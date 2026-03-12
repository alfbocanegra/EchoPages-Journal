import React, { useState } from 'react';
import HandwritingInputCanvas from './components/HandwritingInputCanvas';

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiProvider, setAiProvider] = useState(
    () => localStorage.getItem('aiProvider') || 'openai'
  );
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('aiApiKey') || '');
  const [aiSaved, setAiSaved] = useState(false);

  const handleSaveAI = () => {
    localStorage.setItem('aiProvider', aiProvider);
    localStorage.setItem('aiApiKey', aiApiKey);
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2000);
  };
  const handleClearAI = () => {
    setAiApiKey('');
    localStorage.removeItem('aiApiKey');
    setAiSaved(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3', padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ textAlign: 'center', margin: 24, flex: 1 }}>
          EchoPages Journal - Desktop Editor Demo
        </h1>
        <button
          onClick={() => setSettingsOpen(true)}
          style={{
            marginLeft: 16,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Settings
        </button>
      </div>
      <h2 style={{ textAlign: 'center' }}>Handwriting Input Demo</h2>
      <p style={{ textAlign: 'center' }}>
        Draw with your mouse, touch, or stylus. Use the Clear and Export buttons below the canvas.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <HandwritingInputCanvas width={500} height={300} />
      </div>
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              minWidth: 320,
              maxWidth: 400,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <h2 style={{ marginBottom: 16 }}>Settings</h2>
            <h3 style={{ marginBottom: 8 }}>AI</h3>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Provider:
              <select
                value={aiProvider}
                onChange={e => setAiProvider(e.target.value)}
                style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="azure">Azure</option>
                <option value="perplexity">Perplexity</option>
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              API Key:
              <input
                type="password"
                value={aiApiKey}
                onChange={e => setAiApiKey(e.target.value)}
                placeholder="Enter your API key"
                style={{ marginLeft: 8, padding: 4, borderRadius: 4, width: '70%' }}
              />
            </label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <button
                onClick={handleSaveAI}
                style={{
                  background: '#8b5cf6',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                Save
              </button>
              <button
                onClick={handleClearAI}
                style={{
                  background: '#eee',
                  color: '#333',
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  marginLeft: 'auto',
                  background: '#eee',
                  color: '#8b5cf6',
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
            {aiSaved && <span style={{ color: 'green', marginBottom: 8 }}>Saved!</span>}
            <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
              Your API key is stored only on this device and never sent to our servers. Supported
              providers: OpenAI, Anthropic, Google, Azure, Perplexity. Use your own key for privacy
              and control.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
