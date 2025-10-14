type NextFetchRequestConfig = {
    revalidate?: number | false;
    tags?: string[];
};

interface FetchAPIOptions {
    method: "GET" | "POST" | "PUT" | "DELETE";
    authToken?: string;
    body?: Record<string, unknown>;
    next?: NextFetchRequestConfig;
}

export async function fetchAPI<T = any>(url: string, options: FetchAPIOptions): Promise<T | null> {
    const { method, authToken, body, next } = options;

    const headers: RequestInit & { next?: NextFetchRequestConfig } = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
        ...(next && { next }),
    };

    try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(url, {
            ...headers,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const contentType = response.headers.get("content-type") ?? "";
        const isJSON = contentType.includes("application/json");

        if (!response.ok) {
            let errorBody: unknown = null;
            if (isJSON) {
                try {
                    errorBody = await response.json();
                } catch {}
            }
            const error = new Error(
                `HTTP ${response.status} ${response.statusText} for ${method} ${url}`
            ) as Error & { status?: number; body?: unknown };
            error.status = response.status;
            error.body = errorBody;
            throw error;
        }

        if (isJSON) {
            return (await response.json()) as T;
        }
        return null;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Request timeout for ${method} ${url}`);
            throw new Error(`Request timeout: ${url}`);
        }
        console.error(`Fetch error for ${method} ${url}:`, error);
        throw error;
    }
}