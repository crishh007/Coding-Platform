export const customFetch = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const response = await fetch(`/api${url}`, options);
  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
      else if (data.message) errorMsg = data.message;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }
  return response.json();
};
