const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export async function loginWithOAuth(provider: string, code: string): Promise<string> {
  // Exchange code for JWT (simulate for now)
  const res = await fetch(`${API_BASE}/auth/oauth/${provider}/callback?code=${encodeURIComponent(code)}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('OAuth login failed');
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('jwt', data.token);
    return data.token;
  }
  throw new Error('No token received');
}

export function getJWT(): string | null {
  return localStorage.getItem('jwt');
} 