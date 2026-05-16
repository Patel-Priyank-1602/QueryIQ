const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function submitQuery(queryText) {
  const res = await fetch(`${API_URL}/queries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: queryText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getQuery(id) {
  const res = await fetch(`${API_URL}/queries/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getRecentQueries() {
  const res = await fetch(`${API_URL}/queries`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function reviewQuery(queryId, status, edits = {}) {
  const body = { status, ...edits };
  const res = await fetch(`${API_URL}/queries/${queryId}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Review failed with status ${res.status}`);
  }
  return res.json();
}
