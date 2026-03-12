const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function loginWithOAuth(provider: string, code: string): Promise<string> {
  // Exchange code for JWT (simulate for now)
  const res = await fetch(
    `${API_BASE}/auth/oauth/${provider}/callback?code=${encodeURIComponent(code)}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
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

export function logout() {
  localStorage.removeItem('jwt');
}

export function isJWTExpired(): boolean {
  const token = getJWT();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// TODO: Use secure cookies and refresh tokens for production
