/**
 * Lightweight client for the Nuae backend API.
 *
 * Mode switching:
 *   - localStorage["nuae:apiBase"] が設定されていれば API モード
 *     例: localStorage.setItem('nuae:apiBase', 'http://localhost:4000')
 *   - 未設定ならモックモード（`window.NUAE.data` をそのまま使う）
 *
 * Pages should use this pattern:
 *
 *   const res = await window.NUAE.api.integrations.list();
 *   if (res) setIntegrations(res);    // API mode
 *   // else fall back to data.integrations
 */
window.NUAE = window.NUAE || {};

(() => {
  const STORAGE_KEY = 'nuae:apiBase';

  function getBase() {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  }

  function setBase(url) {
    if (url) localStorage.setItem(STORAGE_KEY, url);
    else     localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  async function request(path, options = {}) {
    const base = getBase();
    if (!base) return null;        // signals "mock mode"
    const url = base.replace(/\/$/, '') + path;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
    }
    return res.json();
  }

  const api = {
    isLive:  () => Boolean(getBase()),
    getBase,
    setBase,

    health: () => request('/health'),
    ready:  () => request('/health/ready'),

    reservations: {
      list:  (params = {}) => {
        const qs = new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null && v !== '')
        ).toString();
        return request('/api/reservations' + (qs ? `?${qs}` : ''));
      },
      stats: () => request('/api/reservations/stats')
    },

    integrations: {
      list:        ()                        => request('/api/integrations'),
      get:         (id)                      => request(`/api/integrations/${id}`),
      setConnected:(id, connected, body = {})=> request(`/api/integrations/${id}/connection`, {
        method: 'PATCH', body: JSON.stringify({ connected, ...body })
      }),
      sync:        (id)                      => request(`/api/integrations/${id}/sync`, { method: 'POST' })
    }
  };

  window.NUAE.api = api;
})();
