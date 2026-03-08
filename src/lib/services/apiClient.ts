// apiClient.js
import { API_BASE } from "@/config";

let isRefreshing: boolean = false;
let refreshPromise: Promise<Response> | null = null;

interface IApiRequest {
    method?: string, 
    headers?: {}, 
    body?: any
}

export async function apiFetchJson(url: string, options: IApiRequest = {}, extraParams = {}) {
    const res = await apiFetch(url, options, extraParams);
    return res.json();
}

export async function apiFetchText(url: string, options: IApiRequest = {}, extraParams = {}) {
    const res = await apiFetch(url, options, extraParams);
    return res.text();
}

export async function apiFetch(url: string, options: IApiRequest = {}, extraParams = {}) {

    const makeRequest = async () => {

        const baseParams = Object.entries(extraParams).reduce<Record<string, string>>(
            (acc, [key, value]) => {
                if (value !== null && value !== undefined) {
                    acc[key] = String(value);
                }
                return acc;
            },
            {}
        );
        const queryString = new URLSearchParams(baseParams).toString();

        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(options.headers || {}),
        };

        const separator = url.includes("?") ? "&" : "?";

        return fetch(`${API_BASE ? API_BASE : "https://api.latair-rp.com"}${url}${separator}${queryString}`, {
            ...options,
            headers,
            credentials: "include",
        });
    };

    let res = await makeRequest();

    if (res.status === 401) {
        try {
            const refreshRes = await refreshToken();
            if (refreshRes?.ok) {
                res = await makeRequest();
            }
        } catch (e) {
            console.error("Не удалось обновить токен:", e);
            throw e;
        }
    }

    if (!res.ok) {
        throw new Error(`Ошибка запроса: ${res.status}`);
    }

    return res;
}

export async function refreshToken() {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
            .then(res => {
                if (!res.ok) {
                    console.error(res)
                    throw new Error("Refresh failed");
                }
                return res;
            })
            .finally(() => {
                isRefreshing = false;
            });
    }
    return refreshPromise;
}