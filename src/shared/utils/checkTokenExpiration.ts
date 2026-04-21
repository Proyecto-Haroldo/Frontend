export const isTokenExpired = (token: string | null): boolean => {
    try {
        if (!token) return true;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;

        if (!exp) return false;

        return exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};