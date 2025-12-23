export async function apiGet(path: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    // attach Netlify Identity JWT if available
    // @ts-ignore
    const ni = (window as any).netlifyIdentity;
    if (ni && typeof ni.currentUser === 'function') {
      const current = ni.currentUser();
      if (current && current.token && current.token.access_token) {
        headers['Authorization'] = `Bearer ${current.token.access_token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  const resp = await fetch(path, { method: 'GET', headers });
  if (!resp.ok) throw new Error(`apiGet ${path} failed: ${resp.status}`);
  return resp.json();
}

export async function apiPost(path: string, body: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    // @ts-ignore
    const ni = (window as any).netlifyIdentity;
    if (ni && typeof ni.currentUser === 'function') {
      const current = ni.currentUser();
      if (current && current.token && current.token.access_token) {
        headers['Authorization'] = `Bearer ${current.token.access_token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  const resp = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error(`apiPost ${path} failed: ${resp.status}`);
  return resp.json();
}


