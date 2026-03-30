const STORAGE_KEY = 'smartlearn_mentor_requests'

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

export function addMentorRequest(formData) {
  const requests = readRequests()

  const request = {
    id: `req_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    experience: formData.experience,
    reason: formData.reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    meetingTime: '',
    meetingLink: '',
    adminNote: '',
  }

  requests.push(request)
  writeRequests(requests)

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
