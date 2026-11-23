const API_BASE_URL = "/api";

 export async function request(
  endpoint: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    options,
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ?? "Ein unbekannter Fehler ist aufgetreten.",
    );
  }

  return response;
}