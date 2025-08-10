import {computed} from "vue";

// Computed API base URL based on current window location
export const apiBaseUrl = computed(() => {
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // If running on standard HTTP/HTTPS ports, don't include port
    if (
      (protocol === "http:" && port === "80") ||
      (protocol === "https:" && port === "443") ||
      !port
    ) {
      return `${protocol}//${hostname}`;
    }

    return `${protocol}//${hostname}:${port}`;
  }

  // Fallback for SSR or when window is not available
  return "http://192.168.4.1";
});

// API helper function
export const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = apiBaseUrl.value;
  const url = `${baseUrl}${endpoint}`;

  console.log(`API call to ${url}`, options);

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`API call failed:`, error);
    throw error;
  }
};
