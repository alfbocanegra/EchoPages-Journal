import React, { useState, useEffect, useCallback, useRef } from 'react';
import ThemeCard from '../components/common/ThemeCard';
import ThemeListItem from '../components/common/ThemeListItem';
import ThemeButton from '../components/common/ThemeButton';
import ThemeInput from '../components/common/ThemeInput';
import {
  FaUserCircle,
  FaPalette,
  FaBell,
  FaInfoCircle,
  FaSignOutAlt,
  FaChevronRight,
} from 'react-icons/fa';
import ThemeSwitcher from '../components/common/ThemeSwitcher';
import { useTheme } from '../styles/ThemeProvider';
import { SyncNotificationBar } from '../components/common/SyncNotificationBar';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import TOTPSetupSection from '../components/settings/TOTPSetupSection';
import { MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import AppHeader from '../components/common/AppHeader';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SettingsPage: React.FC = () => {
  const { jwt, deviceId, passphrase, isAdmin, setIsAdmin } = useAuth();
  const [username, setUsername] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@example.com');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const {
    mode: currentThemeMode,
    highContrast,
    setHighContrast,
    accessibilityMode,
    setAccessibilityMode,
  } = useTheme();
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [adminErrorAlert, setAdminErrorAlert] = useState<string | null>(null);
  const lastErrorRef = useRef<string | null>(null);
  const [downloadingMetrics, setDownloadingMetrics] = useState(false);
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('aiProvider') || 'openai');
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem('aiApiKey') || '');
  const [aiSaved, setAiSaved] = useState(false);

  const fetchErrorLogs = useCallback(async () => {
    setLoadingErrors(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/sync/errors', { credentials: 'include' });
      if (res.ok) {
        setErrorLogs(await res.json());
      } else {
        setErrorMsg('Failed to fetch error logs.');
      }
    } catch (err) {
      setErrorMsg('Failed to fetch error logs.');
    }
    setLoadingErrors(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchErrorLogs();
  }, [isAdmin, fetchErrorLogs]);

  // Poll /sync/metrics every 10s for admin chart
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/sync/metrics', { credentials: 'include' });
        if (res.ok) {
          const metrics = await res.json();
          setMetricsHistory(prev => {
            const next = [...prev, { ...metrics, ts: Date.now() }];
            return next.length > 30 ? next.slice(-30) : next;
          });
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Poll for new errors every 10s and show alert if new error appears
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/sync/errors', { credentials: 'include' });
        if (res.ok) {
          const errors = await res.json();
          const last = errors[errors.length - 1];
          if (last && last !== lastErrorRef.current) {
            setAdminErrorAlert(last);
            lastErrorRef.current = last;
            setTimeout(() => setAdminErrorAlert(null), 10000);
          }
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleDownloadMetrics = async () => {
    setDownloadingMetrics(true);
    try {
      const res = await fetch('/sync/metrics/history', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sync-metrics-history.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloadingMetrics(false);
    }
  };

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
    <>
      {isAdmin && adminErrorAlert && (
        <div
          style={{
            position: 'fixed',
            top: 48,
            left: 0,
            right: 0,
            zIndex: 2000,
            background: '#B3261E',
            color: '#fff',
            padding: 12,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          <span>{adminErrorAlert}</span>
          <button
            style={{
              marginLeft: 16,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
            }}
            onClick={() => setAdminErrorAlert(null)}
          >
            ×
          </button>
        </div>
      )}
      <SyncNotificationBar />
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: currentThemeMode === 'dark' ? '#f1f3f4' : '#1e293b',
          minHeight: '100vh',
          transition: 'all 0.3s ease',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: '40px 20px 20px 20px',
        }}
      >
        <AppHeader showSyncStatus showEncryption />
      <div style={{ maxWidth: 480, margin: '32px auto', padding: 16 }}>
        <h1
          style={{
            fontSize: 'var(--font-size-heading, 2rem)',
            fontWeight: 700,
            marginBottom: 24,
            fontFamily: 'var(--font-family, system-ui)',
          }}
        >
          Settings
        </h1>
        <ThemeCard>
          <h2
            style={{
              fontSize: 'var(--font-size-subheading, 1.25rem)',
              fontWeight: 600,
              marginBottom: 12,
              fontFamily: 'var(--font-family, system-ui)',
            }}
          >
            Account
          </h2>
          <ThemeInput
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <ThemeInput
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <ThemeButton title="Update Account" variant="primary" style={{ marginTop: 8 }} />
        </ThemeCard>
        <ThemeCard>
          <h2
            style={{
              fontSize: 'var(--font-size-subheading, 1.25rem)',
              fontWeight: 600,
              marginBottom: 12,
              fontFamily: 'var(--font-family, system-ui)',
            }}
          >
            Preferences
          </h2>
          <ThemeSwitcher />
          <ThemeListItem
            title="Theme"
            subtitle={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
            leading={<FaPalette size={22} color="var(--color-primary, #6750A4)" />}
            trailing={<FaChevronRight size={18} color="#888" />}
            onClick={() =>
              setThemeMode(
                themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light'
              )
            }
            accessibilityLabel="Theme settings"
          />
          <ThemeListItem
            title="Notifications"
            subtitle="Reminders and alerts"
            leading={<FaBell size={20} color="var(--color-info, #0288d1)" />}
            trailing={<FaChevronRight size={18} color="#888" />}
            onClick={() => {}}
            accessibilityLabel="Notification settings"
          />
          <ThemeButton
            title={highContrast ? 'Disable High Contrast' : 'Enable High Contrast'}
            variant={highContrast ? 'secondary' : 'outline'}
            onClick={() => setHighContrast(!highContrast)}
            style={{ marginTop: 12 }}
          />
          <ThemeButton
            title={accessibilityMode ? 'Disable Accessibility Mode' : 'Enable Accessibility Mode'}
            variant={accessibilityMode ? 'secondary' : 'outline'}
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            style={{ marginTop: 8 }}
          />
        </ThemeCard>
        <ThemeCard>
          <h2
            style={{
              fontSize: 'var(--font-size-subheading, 1.25rem)',
              fontWeight: 600,
              marginBottom: 12,
              fontFamily: 'var(--font-family, system-ui)',
            }}
          >
            About
          </h2>
          <ThemeListItem
            title="App Info"
            subtitle="Version 1.0.0"
            leading={<FaInfoCircle size={20} color="var(--color-success, #388e3c)" />}
            trailing={<FaChevronRight size={18} color="#888" />}
            onClick={() => {}}
            accessibilityLabel="About EchoPages Journal"
          />
          <ThemeListItem
            title="Sign Out"
            leading={<FaSignOutAlt size={20} color="var(--color-error, #B3261E)" />}
            onClick={() => {}}
            accessibilityLabel="Sign out"
            selected
          />
        </ThemeCard>
        <ThemeCard>
          <h2
            style={{
              fontSize: 'var(--font-size-subheading, 1.25rem)',
              fontWeight: 600,
              marginBottom: 12,
              fontFamily: 'var(--font-family, system-ui)',
            }}
          >
            Diagnostics
          </h2>
          {isAdmin && (
            <ThemeButton
              title={downloadingMetrics ? 'Downloading...' : 'Download Metrics History'}
              onClick={handleDownloadMetrics}
              disabled={downloadingMetrics}
              style={{ marginBottom: 16 }}
            />
          )}
          <ThemeListItem
            title="Theme Mode"
            subtitle={currentThemeMode.charAt(0).toUpperCase() + currentThemeMode.slice(1)}
            leading={<FaPalette size={20} color="var(--color-primary, #6750A4)" />}
            accessibilityLabel="Current theme mode"
          />
          <ThemeListItem
            title="High Contrast Mode"
            subtitle={highContrast ? 'Enabled' : 'Disabled'}
            leading={<FaPalette size={20} color="var(--color-primary, #6750A4)" />}
            accessibilityLabel="High contrast mode state"
          />
          <ThemeListItem
            title="Accessibility Mode"
            subtitle={accessibilityMode ? 'Enabled' : 'Disabled'}
            leading={<FaPalette size={20} color="var(--color-primary, #6750A4)" />}
            accessibilityLabel="Accessibility mode state"
          />
          {isAdmin && metricsHistory.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Sync Metrics Trend (last 5 min)
              </h3>
              <Line
                data={{
                  labels: metricsHistory.map(m => new Date(m.ts).toLocaleTimeString()),
                  datasets: [
                    {
                      label: 'Connections',
                      data: metricsHistory.map(m => m.totalConnections),
                      borderColor: '#388e3c',
                      backgroundColor: 'rgba(56,142,60,0.2)',
                      fill: false,
                    },
                    {
                      label: 'Requests',
                      data: metricsHistory.map(m => m.syncRequests),
                      borderColor: '#0288d1',
                      backgroundColor: 'rgba(2,136,209,0.2)',
                      fill: false,
                    },
                    {
                      label: 'Updates',
                      data: metricsHistory.map(m => m.syncUpdates),
                      borderColor: '#fbc02d',
                      backgroundColor: 'rgba(251,192,45,0.2)',
                      fill: false,
                    },
                    {
                      label: 'Errors',
                      data: metricsHistory.map(m => m.syncErrors),
                      borderColor: '#B3261E',
                      backgroundColor: 'rgba(179,38,30,0.2)',
                      fill: false,
                    },
                    {
                      label: 'Conflicts',
                      data: metricsHistory.map(m => m.syncConflicts),
                      borderColor: '#ff9800',
                      backgroundColor: 'rgba(255,152,0,0.2)',
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' }, title: { display: false } },
                  scales: { x: { title: { display: false } }, y: { beginAtZero: true } },
                }}
                height={220}
              />
            </div>
          )}
          {isAdmin && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                Sync Error Logs (last 100)
              </h3>
              <ThemeButton
                title={loadingErrors ? 'Refreshing...' : 'Refresh Logs'}
                onClick={fetchErrorLogs}
                disabled={loadingErrors}
                style={{ marginBottom: 8 }}
              />
              {errorMsg && <div style={{ color: 'red', marginBottom: 8 }}>{errorMsg}</div>}
              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  background: '#222',
                  color: '#eee',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  borderRadius: 6,
                  padding: 8,
                  border: '1px solid #444',
                }}
              >
                {errorLogs.length === 0 && !loadingErrors ? (
                  <div>No recent sync errors.</div>
                ) : (
                  errorLogs.map((line, i) => <div key={i}>{line}</div>)
                )}
              </div>
            </div>
          )}
        </ThemeCard>
        <ThemeCard>
          <h2
            style={{
              fontSize: 'var(--font-size-subheading, 1.25rem)',
              fontWeight: 600,
              marginBottom: 12,
              fontFamily: 'var(--font-family, system-ui)',
            }}
          >
            Two-Factor Authentication (2FA)
          </h2>
          <TOTPSetupSection />
        </ThemeCard>
          <ThemeCard>
            <h2
              style={{
                fontSize: 'var(--font-size-subheading, 1.25rem)',
                fontWeight: 600,
                marginBottom: 12,
                fontFamily: 'var(--font-family, system-ui)',
              }}
            >
              AI
            </h2>
            <FormControl fullWidth style={{ marginBottom: 16 }}>
              <InputLabel id="ai-provider-label">Provider</InputLabel>
              <Select
                labelId="ai-provider-label"
                value={aiProvider}
                label="Provider"
                onChange={e => setAiProvider(e.target.value)}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="azure">Azure</MenuItem>
                <MenuItem value="perplexity">Perplexity</MenuItem>
              </Select>
              <FormHelperText>Select your preferred AI provider for journaling prompts and suggestions.</FormHelperText>
            </FormControl>
            <ThemeInput
              label="API Key"
              value={aiApiKey}
              onChange={e => setAiApiKey(e.target.value)}
              style={{ marginBottom: 12 }}
              type="password"
              placeholder="Enter your AI provider API key"
            />
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <ThemeButton title="Save" onClick={handleSaveAI} variant="primary" />
              <ThemeButton title="Clear" onClick={handleClearAI} variant="secondary" />
              {aiSaved && <span style={{ color: 'green', alignSelf: 'center' }}>Saved!</span>}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
              Your API key is stored only on this device and never sent to our servers. Supported providers: OpenAI, Anthropic, Google, Azure, Perplexity. Use your own key for privacy and control.
            </div>
          </ThemeCard>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
