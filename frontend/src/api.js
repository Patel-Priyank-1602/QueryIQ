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

/**
 * Check the status of an async pipeline query.
 */
export async function getQueryStatus(queryId) {
  const res = await fetch(`${API_URL}/queries/${queryId}/status`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Status check failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Connect to the SSE stream for real-time pipeline progress.
 *
 * @param {string} queryId - UUID of the query to stream updates for
 * @param {function} onStageUpdate - Called with each stage event: { stage, status, details, duration_ms }
 * @param {function} onComplete - Called with the final result when pipeline completes
 * @param {function} onError - Called with error message on failure
 * @returns {function} cleanup - Call to close the SSE connection
 */
export function streamQueryProgress(queryId, onStageUpdate, onComplete, onError) {
  const url = `${API_URL}/queries/${queryId}/stream`;

  let eventSource;

  try {
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.stage === "complete") {
          onComplete(data.result || data);
          eventSource.close();
          return;
        }

        if (data.stage === "error") {
          onError(data.details || "Pipeline error occurred");
          eventSource.close();
          return;
        }

        if (data.stage === "timeout") {
          onError("Pipeline timed out. Check status manually.");
          eventSource.close();
          return;
        }

        // Regular stage update
        onStageUpdate(data);
      } catch (parseErr) {
        console.warn("[SSE] Failed to parse event:", parseErr);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("[SSE] Connection error, falling back to polling:", err);
      eventSource.close();

      // Fallback to polling
      _pollQueryStatus(queryId, onStageUpdate, onComplete, onError);
    };
  } catch (e) {
    console.warn("[SSE] EventSource not supported, falling back to polling");
    _pollQueryStatus(queryId, onStageUpdate, onComplete, onError);
  }

  // Return cleanup function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}

/**
 * Polling fallback when SSE is unavailable.
 * Polls GET /queries/{id}/status every 2 seconds.
 */
function _pollQueryStatus(queryId, onStageUpdate, onComplete, onError) {
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes max

  const poll = async () => {
    if (attempts >= maxAttempts) {
      onError("Polling timed out after 2 minutes.");
      return;
    }
    attempts++;

    try {
      const status = await getQueryStatus(queryId);

      if (status.status === "processing") {
        onStageUpdate({
          stage: "processing",
          status: "started",
          details: `Processing... (check ${attempts})`,
        });
        setTimeout(poll, 2000);
      } else {
        // Query is done — fetch full result
        try {
          const result = await getQuery(queryId);
          onComplete(result);
        } catch (fetchErr) {
          onError(`Result fetch failed: ${fetchErr.message}`);
        }
      }
    } catch (err) {
      if (attempts < 5) {
        // Retry a few times on network errors
        setTimeout(poll, 3000);
      } else {
        onError(`Status check failed: ${err.message}`);
      }
    }
  };

  setTimeout(poll, 1000); // Start after 1 second
}
