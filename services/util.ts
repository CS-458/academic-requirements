/// Fetch a request (similar to fetch), but throw an error if the request fails
export async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Response code ${res.status} for request to ${url}`);
  }
  return await res.json();
}
