import { auth } from '../firebase'

// Change this to Joe's backend URL when he shares it
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Makes an authenticated request to the backend.
 * Gets the Firebase ID token and sends it as a Bearer JWT in the Authorization header.
 */
async function authFetch(endpoint, options = {}) {
  const user = auth.currentUser
  if (!user) throw new Error('No hay sesión activa.')

  const token = await user.getIdToken()

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error del servidor' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// ── Vendor / Store endpoints ─────────────────────────────────────────────────

export const vendorService = {
  /** Create or update the vendor's store profile */
  createStore: (storeData) =>
    authFetch('/vendors/store', { method: 'POST', body: JSON.stringify(storeData) }),

  /** Get the current user's store profile */
  getMyStore: () => authFetch('/vendors/store'),

  /** Get the current user's vendor requests */
  getMyRequests: () => authFetch('/vendors/requests'),

  /** Submit a new vendor request */
  submitRequest: (requestData) =>
    authFetch('/vendors/requests', { method: 'POST', body: JSON.stringify(requestData) }),
}
