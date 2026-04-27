const API_BASE = "/api";

let csrfTokenCache: string | null = null;
let csrfTokenFetchPromise: Promise<string> | null = null;

function parseErrorDetail(payload: unknown): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map(String).join(" ");
  }
  return "Request failed";
}

export async function getCsrfToken(forceRefresh = false) {
  // Return cached token if available and not forcing refresh
  if (csrfTokenCache && !forceRefresh) {
    return csrfTokenCache;
  }

  // If a fetch is already in progress, wait for it
  if (csrfTokenFetchPromise) {
    return csrfTokenFetchPromise;
  }

  // Fetch new token
  csrfTokenFetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/csrf/`, {
        credentials: "include",
        cache: "no-store",
        method: "GET"
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(parseErrorDetail(err) || "Could not load security token");
      }
      const data = await res.json();
      csrfTokenCache = data.csrfToken as string;
      return csrfTokenCache;
    } finally {
      csrfTokenFetchPromise = null;
    }
  })();

  return csrfTokenFetchPromise;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    cache: "no-store"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseErrorDetail(err));
  }
  return res.json();
}

type PostOptions = { skipCsrf?: boolean };

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      res.ok
        ? "Invalid JSON from server"
        : `Server error (${res.status}). Is the Django backend running on port 8000?`
    );
  }
}

export async function apiPost<T>(path: string, payload: unknown, options?: PostOptions): Promise<T> {
  return apiPostInternal<T>(path, payload, options, 0);
}

async function apiPostInternal<T>(path: string, payload: unknown, options?: PostOptions, retryCount: number = 0): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (!options?.skipCsrf) {
    headers["X-CSRFToken"] = await getCsrfToken(retryCount > 0);  // Force refresh on retry
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25_000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (e) {
    clearTimeout(t);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out. Check that Next.js and Django are running.");
    }
    throw new Error("Network error. Check your connection and that the dev servers are running.");
  }
  clearTimeout(t);

  const data = await parseJsonResponse(res);
  
  // If 403 Forbidden and haven't retried yet, refresh CSRF token and retry
  if (res.status === 403 && retryCount === 0) {
    try {
      // Force refresh CSRF token
      csrfTokenCache = null;
      await getCsrfToken(true);
      // Retry the request
      return apiPostInternal<T>(path, payload, options, 1);
    } catch (retryErr) {
      // If retry fails, throw original error
      throw new Error(parseErrorDetail(data));
    }
  }
  
  if (!res.ok) {
    throw new Error(parseErrorDetail(data));
  }
  return data as T;
}
