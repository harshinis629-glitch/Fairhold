const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE}/api/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchRentals() {
  const res = await fetch(`${API_BASE}/api/rentals`);
  if (!res.ok) throw new Error('Failed to fetch rentals');
  return res.json();
}

export async function fetchRentalById(id) {
  const res = await fetch(`${API_BASE}/api/rentals/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch rental ${id}`);
  return res.json();
}

export async function createRental(data) {
  const res = await fetch(`${API_BASE}/api/rentals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create rental' }));
    throw new Error(err.detail || 'Failed to create rental');
  }
  return res.json();
}

export async function uploadRentalPhotos(rentalId, beforeFile, afterFile) {
  const formData = new FormData();
  if (beforeFile) formData.append('before_image', beforeFile);
  if (afterFile) formData.append('after_image', afterFile);

  const res = await fetch(`${API_BASE}/api/rentals/${rentalId}/upload-photos`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to upload photos' }));
    throw new Error(err.detail || 'Failed to upload photos');
  }
  return res.json();
}

export async function runAiInspection(rentalId) {
  const res = await fetch(`${API_BASE}/api/rentals/${rentalId}/run-inspection`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'AI inspection failed' }));
    throw new Error(err.detail || 'AI inspection failed');
  }
  return res.json();
}

export async function submitOwnerReview(rentalId, findingDecisions, ownerNotes) {
  const res = await fetch(`${API_BASE}/api/rentals/${rentalId}/owner-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      finding_decisions: findingDecisions,
      owner_notes: ownerNotes,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit review' }));
    throw new Error(err.detail || 'Failed to submit review');
  }
  return res.json();
}

export async function executeSettlement(rentalId, renterNotes = '') {
  const res = await fetch(`${API_BASE}/api/rentals/${rentalId}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      confirm_settlement: true,
      renter_notes: renterNotes,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Settlement execution failed' }));
    throw new Error(err.detail || 'Settlement execution failed');
  }
  return res.json();
}

export async function submitDispute(rentalId, disputeReason, renterNotes) {
  const res = await fetch(`${API_BASE}/api/rentals/${rentalId}/dispute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dispute_reason: disputeReason,
      renter_notes: renterNotes,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit dispute' }));
    throw new Error(err.detail || 'Failed to submit dispute');
  }
  return res.json();
}

export async function inspectAdhoc(itemName, category, beforeFile, afterFile) {
  const formData = new FormData();
  formData.append('item_name', itemName);
  formData.append('category', category);
  formData.append('before_image', beforeFile);
  formData.append('after_image', afterFile);

  const res = await fetch(`${API_BASE}/api/inspect-adhoc`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ad-hoc inspection failed' }));
    throw new Error(err.detail || 'Ad-hoc inspection failed');
  }
  return res.json();
}

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}
