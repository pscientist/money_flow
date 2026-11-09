export function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...extra,
    };

    const token = localStorage.getItem('token');

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}
