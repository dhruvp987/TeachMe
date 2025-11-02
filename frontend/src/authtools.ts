const SESSION_TOKEN_KEY = "sessionToken";

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function setSessionToken(token: string) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function isAuthenticated(): boolean {
  return getSessionToken() !== null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}
