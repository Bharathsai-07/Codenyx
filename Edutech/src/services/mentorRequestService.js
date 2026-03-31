const STORAGE_KEY = 'smartlearn_mentor_requests'
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002'

function readRequests() {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRequests(requests) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

export function getMentorRequests() {
  const requests = readRequests()
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

async function parseApiResponse(response) {
  const raw = await response.text()
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function withAuth(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function getMentorRequestsFromApi(token) {
  const response = await fetch(`${API_BASE_URL}/api/mentor-requests/admin`, {
    method: 'GET',
    headers: withAuth(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load mentor requests (HTTP ${response.status})`
    throw new Error(detail)
  }

  const requests = data.requests || []
  writeRequests(requests)
  return requests
}

export async function getMyMentorRequestsFromApi(token) {
  const response = await fetch(`${API_BASE_URL}/api/mentor-requests/my`, {
    method: 'GET',
    headers: withAuth(token),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to load your mentor requests (HTTP ${response.status})`
    throw new Error(detail)
  }

  return data.requests || []
}

export function addMentorRequest(formData) {
  const requests = readRequests()

  const request = {
    id: `req_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    name: formData.name,
    email: formData.email,
    clerkId: formData.clerkId || '',
    subject: formData.subject,
    experience: formData.experience,
    reason: formData.reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    approvedAt: '',
    meetingTime: '',
    meetingLink: '',
    adminNote: '',
  }

  requests.push(request)
  writeRequests(requests)

  return request
}

export async function addMentorRequestToApi(formData, token) {
  const payload = {
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    experience: formData.experience,
    reason: formData.reason,
  }

  const response = await fetch(`${API_BASE_URL}/api/mentor-requests`, {
    method: 'POST',
    headers: withAuth(token),
    body: JSON.stringify(payload),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to submit mentor request (HTTP ${response.status})`
    throw new Error(detail)
  }

  const request = data.request
  if (request) {
    const existing = readRequests().filter((item) => item.id !== request.id)
    writeRequests([request, ...existing])
  }

  return request
}

export function updateMentorRequest(id, updates) {
  const requests = readRequests()
  const idx = requests.findIndex((r) => r.id === id)
  if (idx === -1) return null

  requests[idx] = {
    ...requests[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  writeRequests(requests)
  return requests[idx]
}

export async function updateMentorRequestStatusInApi(id, updates, token) {
  const response = await fetch(`${API_BASE_URL}/api/mentor-requests/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: withAuth(token),
    body: JSON.stringify({
      status: updates.status,
      adminNote: updates.adminNote || '',
    }),
  })

  const data = await parseApiResponse(response)
  if (!response.ok || !data?.ok) {
    const detail = data?.error || data?.message || `Failed to update mentor request (HTTP ${response.status})`
    throw new Error(detail)
  }

  const request = data.request
  if (request) {
    const existing = readRequests().filter((item) => item.id !== request.id)
    writeRequests([request, ...existing])
  }

  return request
}
