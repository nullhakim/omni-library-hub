// Lightweight JWT helpers (no verification — server still enforces auth).
export interface JwtPayload {
    sub?: string
    role?: string
    roles?: string[]
    exp?: number
    [key: string]: unknown
}

export function decodeJwt(token: string | null): JwtPayload | null {
    if (!token) return null
    try {
        const parts = token.split(".")
        if (parts.length < 2) return null
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
        const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4)
        const json = atob(padded)
        // Handle UTF-8
        const decoded = decodeURIComponent(
            json
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        )
        return JSON.parse(decoded) as JwtPayload
    } catch {
        return null
    }
}

export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
}

export function getCurrentRole(): string | null {
    const payload = decodeJwt(getAccessToken())
    if (!payload) return null
    if (typeof payload.role === "string") return payload.role
    if (Array.isArray(payload.roles) && payload.roles.length > 0) return payload.roles[0]
    return null
}

export function isAdmin(): boolean {
    const payload = decodeJwt(getAccessToken())
    if (!payload) return false
    if (payload.role === "admin") return true
    if (Array.isArray(payload.roles) && payload.roles.includes("admin")) return true
    return false
}
