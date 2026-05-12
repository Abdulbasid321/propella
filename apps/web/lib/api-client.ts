import { API_URL } from './constants'

let _accessToken: string | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getAccessToken() {
  return _accessToken
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && path !== '/auth/login' && path !== '/auth/refresh') {
    // Try refresh
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (refreshRes.ok) {
      const data = await refreshRes.json() as { data: { accessToken: string } }
      _accessToken = data.data.accessToken
      headers['Authorization'] = `Bearer ${_accessToken}`
      const retry = await fetch(`${API_URL}/api${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retry.ok) {
        const err = await retry.json() as { error: string }
        throw new Error(err.error ?? 'Request failed')
      }
      return retry.json() as Promise<T>
    } else {
      _accessToken = null
      // Signal logout to auth store
      window.dispatchEvent(new CustomEvent('propella:logout'))
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error: string }
    throw new Error(err.error ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
}
