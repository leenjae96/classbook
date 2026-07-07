// 관리자 PIN 게이트 토큰 관리 (sessionStorage — 탭 닫으면 소멸)
const TOKEN_KEY = 'admin_token';
const EXPIRES_KEY = 'admin_token_expires';

export const getAdminToken = (): string | null => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const expiresAt = Number(sessionStorage.getItem(EXPIRES_KEY) || 0);
    if (expiresAt && Date.now() >= expiresAt) {
        clearAdminToken();
        return null;
    }
    return token;
};

export const setAdminToken = (token: string, expiresAt: number) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EXPIRES_KEY, String(expiresAt));
};

export const clearAdminToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
};
