export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, options);
  const body = await response.json().catch(() => ({ error: "The server could not be reached." }));
  if (!response.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body;
}
