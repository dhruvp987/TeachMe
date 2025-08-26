const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || '';

function fmtResponseErrMsg(status: number, detail: string): string {
  return `Response Error: Status: ${status}, Detail: ${detail}`;
}

export async function newAccount(email: string, password: string) {
  const response = await fetch(BASE_URL + '/auth/new-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email, password: password })
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(fmtResponseErrMsg(response.status, JSON.stringify(json.detail)));
  }
  localStorage.setItem('sessionId', json.sessionId);
}
