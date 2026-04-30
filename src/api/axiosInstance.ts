import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL || ""

const axiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Request interceptor: attach access token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token")
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor: try refresh on 401
let isRefreshing = false
let pendingQueue: Array<(token: string | null) => void> = []

const flushQueue = (token: string | null) => {
    pendingQueue.forEach((cb) => cb(token))
    pendingQueue = []
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !originalRequest?.url?.includes("/api/auth/")
        ) {
            const refreshToken = localStorage.getItem("refresh_token")
            if (!refreshToken) return Promise.reject(error)

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push((token) => {
                        if (!token) return reject(error)
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        resolve(axiosInstance(originalRequest))
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true
            try {
                const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
                    refresh_token: refreshToken,
                })
                const newAccess = data?.data?.access_token
                const newRefresh = data?.data?.refresh_token
                if (newAccess) localStorage.setItem("access_token", newAccess)
                if (newRefresh) localStorage.setItem("refresh_token", newRefresh)
                flushQueue(newAccess ?? null)
                originalRequest.headers.Authorization = `Bearer ${newAccess}`
                return axiosInstance(originalRequest)
            } catch (e) {
                flushQueue(null)
                localStorage.removeItem("access_token")
                localStorage.removeItem("refresh_token")
                return Promise.reject(e)
            } finally {
                isRefreshing = false
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
