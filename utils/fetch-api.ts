type NextFetchRequestConfig = {
    revalidate?: number | false;
    tags?: string[];
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 8000;

/** Các mã lỗi gateway/ server tạm thời — có thể retry (vd: Railway cold start). */
const RETRYABLE_STATUS = [502, 503, 504];

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const isGet = method === "GET";
    let lastError: Error & { status?: number; body?: unknown } | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            const response = await fetch(url, {
                ...headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get("content-type") ?? "";
            const isJSON = contentType.includes("application/json");

            if (!response.ok) {
                const retryable = isGet && RETRYABLE_STATUS.includes(response.status);
                if (retryable && attempt < MAX_RETRIES) {
                    await response.text().catch(() => {});
                    if (attempt === 1) {
                        console.warn(
                            `[fetchAPI] ${response.status} ${response.statusText} for ${url}, retry ${attempt}/${MAX_RETRIES} sau ${RETRY_DELAY_MS}ms...`
                        );
                    }
                    await sleep(RETRY_DELAY_MS);
                    continue;
                }

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
            lastError = error instanceof Error ? (error as Error & { status?: number; body?: unknown }) : new Error(String(error));

            const isTimeoutRetry = isGet && attempt < MAX_RETRIES && lastError?.name === "AbortError";
            if (isTimeoutRetry) {
                console.warn(
                    `[fetchAPI] Timeout cho ${url}, retry ${attempt}/${MAX_RETRIES} sau ${RETRY_DELAY_MS}ms...`
                );
                await sleep(RETRY_DELAY_MS);
                continue;
            }

            if (lastError?.name === "AbortError") {
                console.error(`Request timeout for ${method} ${url}`);
                throw new Error(`Request timeout: ${url}`);
            }
            console.error(`Fetch error for ${method} ${url}:`, error);
            throw error;
        }
    }

    if (lastError) throw lastError;
    return null;
}