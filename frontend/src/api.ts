import { clearSession, getSessionToken, isAuthenticated, setSessionToken } from './authtools';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';

function fmtResponseErrMsg(status: number, detail: string): string {
  return `Response Error: Status: ${status}, Detail: ${detail}`;
}

function addAuthHeader(headers: Record<string, string>): HeadersInit {
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers['Authorization'] = sessionToken;
  }
  return headers;
}

function addJsonHeader(headers: Record<string, string>): HeadersInit {
  headers['Content-Type'] = 'application/json';
  return headers;
}

function contentJsonAuthedHeaders(): HeadersInit {
  const headers = {};
  addAuthHeader(headers);
  addJsonHeader(headers);
  return headers;
}

export async function newAccount(email: string, password: string) {
  const response = await fetch(BASE_URL + '/auth/new-account', {
    method: 'POST',
    headers: addJsonHeader({}),
    body: JSON.stringify({ email: email, password: password })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  setSessionToken(json.sessionToken);
}

export async function newSession(email: string, password: string) {
  const response = await fetch(BASE_URL + '/auth/new-session', {
    method: 'POST',
    headers: addJsonHeader({}),
    body: JSON.stringify({ email: email, password: password })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  setSessionToken(json.sessionToken);
}

export async function sessionExpire() {
  if (!isAuthenticated()) return;

  const response = await fetch(BASE_URL + '/auth/session-expire', {
    method: 'POST',
    headers: addAuthHeader({})
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  clearSession();
}

export async function uploadNote(noteFile: File): Promise<{ noteId: string }> {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  const formData = new FormData();
  formData.append('note', noteFile);
  
  const response = await fetch(BASE_URL + '/notes/note-upload', {
    method: 'POST',
    headers: addAuthHeader({}),
    body: formData
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  return json;
}

export async function newChat(): Promise<{ chatId: string }> {
  const response = await fetch(BASE_URL + '/chat/new-chat', {
    method: 'POST',
    headers: contentJsonAuthedHeaders()
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  return json;
}

export async function getChats(): Promise<{ chatIds: string[] }> {
  const response = await fetch(BASE_URL + '/chat/chats', {
    method: 'GET',
    headers: contentJsonAuthedHeaders()
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  return json;
}

export async function getConversation(chatId: string): Promise<{ conversation: Array<{ role: string; content: string }> }> {
  const response = await fetch(BASE_URL + '/chat/conversation/' + chatId, {
    method: 'GET',
    headers: contentJsonAuthedHeaders()
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  return json;
}

export async function sendPrompt(chatId: string, prompt: string): Promise<{ response: string }> {
  const response = await fetch(BASE_URL + '/chat/student-response', {
    method: 'POST',
    headers: contentJsonAuthedHeaders(),
    body: JSON.stringify({ chatId: chatId, prompt: prompt })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  return json;
}
