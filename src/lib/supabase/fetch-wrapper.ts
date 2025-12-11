/**
 * Custom fetch wrapper to handle Windows DNS/SSL issues with Supabase
 * This wrapper adds retry logic and better error handling for network issues
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

export async function customFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = input instanceof Request ? input.url : input;
  const options: FetchOptions = init || {};
  const { retries = 3, retryDelay = 100, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[customFetch] Attempt ${attempt + 1}/${retries} failed:`,
        lastError.message
      );

      if (attempt < retries - 1) {
        // Wait before retrying with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}
