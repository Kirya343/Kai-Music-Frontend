// apiClient.ts
import { API_BASE } from "@/config";
import axios from "axios";

/**
 * Base Axios instance configured for API requests.
 */
const api = axios.create({
    baseURL: API_BASE || "https://music.workswap.org",
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

/**
 * Shared promise for concurrent token refresh requests.
 */
let refreshPromise: Promise<void> | null = null;

/**
 * Configures automatic authentication token refresh on HTTP 401 responses.
 *
 * Concurrent requests share the same refresh operation.
 * After a successful refresh, the original request is retried.
 *
 * @param instance - Axios instance to configure.
 * @returns The configured Axios instance.
 */
const setupAuthInterceptor = (instance: typeof api) => {
    instance.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;

            if (
                error.response?.status !== 401 ||
                originalRequest._retry
            ) {
                throw error;
            }

            originalRequest._retry = true;

            if (!refreshPromise) {
                refreshPromise = axios
                    .post("/auth/refresh", null, {
                        baseURL: api.defaults.baseURL,
                        withCredentials: true,
                    })
                    .then(() => undefined)
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;

            return instance(originalRequest);
        }
    );

    return instance;
};

setupAuthInterceptor(api);

/**
 * Creates an Axios client scoped to a specific API endpoint.
 *
 * Inherits the base client's configuration and enables automatic
 * authentication token refresh.
 *
 * @param prefix - API endpoint prefix (e.g., "/audio").
 * @returns A configured Axios instance for the specified endpoint.
 */
export const createApi = (prefix: string) =>
    setupAuthInterceptor(
        axios.create({
            ...api.defaults,
            baseURL: `${api.defaults.baseURL}${prefix}`,
        })
    );

export default api;