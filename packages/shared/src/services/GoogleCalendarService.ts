/**
 * GoogleCalendarService
 * Cross-platform service for integrating with Google Calendar API.
 * Handles OAuth flow, token storage, and calendar event sync.
 *
 * TODO: Implement platform-specific OAuth logic (mobile/web/desktop)
 * TODO: Securely store and refresh tokens (use platform secure storage)
 * TODO: Implement event fetch, create, update, delete
 */

import { Platform } from '../utils/platform';
// Only import AuthSession if running in Expo
let AuthSession: any;
if (Platform.OS !== 'web') {
  try {
    AuthSession = require('expo-auth-session');
  } catch {
    // intentionally empty
  }
}

let SecureStore: any;
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch {
    // intentionally empty
  }
}

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // TODO: Replace with actual client ID
const REDIRECT_URI = AuthSession ? AuthSession.makeRedirectUri({ useProxy: true }) : '';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'openid', 'profile', 'email'];
const TOKEN_KEY = 'google_calendar_token';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string; // ISO date
  end: string; // ISO date
  location?: string;
  attendees?: string[];
}

export class GoogleCalendarService {
  // --- OAuth ---
  static async startOAuthFlow(): Promise<void> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (!AuthSession) throw new Error('Expo AuthSession not available');
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(SCOPES.join(' '))}`;
      const result = await AuthSession.startAsync({ authUrl });
      if (result.type === 'success' && result.params && result.params.access_token) {
        await GoogleCalendarService.storeToken(result.params.access_token);
      } else if (result.type === 'error') {
        throw new Error(result.params.error_description || 'OAuth error');
      } else {
        throw new Error('OAuth flow cancelled or failed');
      }
    } else {
      // TODO: Implement web/desktop OAuth
      throw new Error('OAuth flow not implemented for this platform');
    }
  }

  static async storeToken(token: string): Promise<void> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (!SecureStore) throw new Error('Expo SecureStore not available');
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } else {
      // TODO: Implement secure storage for web/desktop
      throw new Error('Token storage not implemented for this platform');
    }
  }

  static async getToken(): Promise<string | null> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      if (!SecureStore) throw new Error('Expo SecureStore not available');
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } else {
      // TODO: Implement secure retrieval for web/desktop
      throw new Error('Token retrieval not implemented for this platform');
    }
  }

  // --- Calendar Events ---
  static async fetchEvents(): Promise<GoogleCalendarEvent[]> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const token = await GoogleCalendarService.getToken();
      if (!token) throw new Error('No Google Calendar token found. Please connect your account.');
      // Google Calendar API endpoint for primary calendar events
      const endpoint =
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true&timeMin=' +
        encodeURIComponent(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error?.message || 'Failed to fetch Google Calendar events');
      }
      const data = await res.json();
      if (!Array.isArray((data as any).items)) return [];
      return (data as any).items.map((item: any) => ({
        id: item.id,
        summary: item.summary || '',
        description: item.description,
        start: item.start?.dateTime || item.start?.date || '',
        end: item.end?.dateTime || item.end?.date || '',
        location: item.location,
        attendees: item.attendees?.map((a: any) => a.email) || [],
      }));
    } else {
      // TODO: Implement for web/desktop
      throw new Error('Fetch events not implemented for this platform');
    }
  }

  static async createEvent(event: GoogleCalendarEvent): Promise<void> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const token = await GoogleCalendarService.getToken();
      if (!token) throw new Error('No Google Calendar token found. Please connect your account.');
      // Google Calendar API endpoint for creating an event
      const endpoint = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start },
          end: { dateTime: event.end },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error?.message || 'Failed to create Google Calendar event');
      }
    } else {
      // TODO: Implement for web/desktop
      throw new Error('Create event not implemented for this platform');
    }
  }

  static async updateEvent(event: GoogleCalendarEvent): Promise<void> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const token = await GoogleCalendarService.getToken();
      if (!token) throw new Error('No Google Calendar token found. Please connect your account.');
      // Google Calendar API endpoint for updating an event
      const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: { dateTime: event.start },
          end: { dateTime: event.end },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error?.message || 'Failed to update Google Calendar event');
      }
    } else {
      // TODO: Implement for web/desktop
      throw new Error('Update event not implemented for this platform');
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const token = await GoogleCalendarService.getToken();
      if (!token) throw new Error('No Google Calendar token found. Please connect your account.');
      // Google Calendar API endpoint for deleting an event
      const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error?.message || 'Failed to delete Google Calendar event');
      }
    } else {
      // TODO: Implement for web/desktop
      throw new Error('Delete event not implemented for this platform');
    }
  }
}
