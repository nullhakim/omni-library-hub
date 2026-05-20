/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { MailWarning, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isEmailVerified, decodeJwt, getAccessToken } from "@/lib/auth"
import axiosInstance from "@/api/axiosInstance"

export default function EmailVerificationBanner() {
    const [token, setToken] = useState(typeof window !== "undefined" ? localStorage.getItem("access_token") : null)

    useEffect(() => {
        const handleAuthUpdate = () => {
            setToken(localStorage.getItem("access_token"))
        }
        window.addEventListener("auth-updated", handleAuthUpdate)
        window.addEventListener("storage", handleAuthUpdate)
        return () => {
            window.removeEventListener("auth-updated", handleAuthUpdate)
            window.removeEventListener("storage", handleAuthUpdate)
        }
    }, [])

    const verified = isEmailVerified()

    // Get email from JWT to include in resend request body
    const payload = token ? decodeJwt(getAccessToken()) : null
    const userEmail = typeof payload?.email === "string" ? payload.email : ""

    const [dismissed, setDismissed] = useState(false)
    const [sending, setSending] = useState(false)

    // Only show when logged in AND not yet verified AND not dismissed this session
    if (!token || verified || dismissed) return null

    const handleResend = async () => {
        setSending(true)
        try {
            let targetEmail = userEmail;
            // Fallback: if JWT doesn't contain email, fetch it from profile
            if (!targetEmail) {
                const res = await axiosInstance.get("/api/users/me")
                targetEmail = res.data.data.email
            }

            if (!targetEmail) {
                throw new Error("Could not find email address.")
            }

            await axiosInstance.post("/api/auth/resend-verification", { email: targetEmail })
            toast.success("Verification email sent! Check your inbox.")
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message || "Failed to send verification email.")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/60">
            <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Icon + text */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <MailWarning className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm leading-snug">
                        <span className="font-semibold text-amber-800 dark:text-amber-300">
                            Please verify your email address.
                        </span>{" "}
                        <span className="text-amber-700 dark:text-amber-400">
                            Check your inbox for the link we sent when you registered.
                        </span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-6 sm:ml-0">
                    <Button
                        size="sm"
                        variant="outline"
                        id="btn-resend-verification-banner"
                        onClick={handleResend}
                        disabled={sending}
                        className="rounded-full h-8 px-4 text-xs gap-1.5 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-900/40"
                    >
                        <RefreshCw className={`h-3 w-3 ${sending ? "animate-spin" : ""}`} />
                        {sending ? "Sending…" : "Resend email"}
                    </Button>
                    <button
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss notification"
                        className="p-1 rounded text-amber-500 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
