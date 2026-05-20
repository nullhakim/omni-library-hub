/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/api/axiosInstance"

type Status = "loading" | "success" | "error" | "no-token"

export default function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<Status>(token ? "loading" : "no-token")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) return

        const verify = async () => {
            try {
                await axiosInstance.get(`/api/verify-email?token=${token}`)
                setStatus("success")
                setMessage("Your email address has been verified successfully.")
            } catch (err: any) {
                setStatus("error")
                setMessage(
                    err.response?.data?.error ||
                    "Verification failed. The link may have expired or already been used."
                )
            }
        }

        verify()
    }, [token])

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm text-center space-y-8">

                {/* ── Loading ── */}
                {status === "loading" && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <Loader2 className="h-9 w-9 text-muted-foreground animate-spin" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
                                Please wait
                            </p>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Verifying your{" "}
                                <span className="italic font-light">email.</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                This only takes a moment…
                            </p>
                        </div>
                    </>
                )}

                {/* ── Success ── */}
                {status === "success" && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                                <CheckCircle2 className="h-9 w-9 text-accent" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">
                                Verified
                            </p>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Email{" "}
                                <span className="italic font-light">confirmed!</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">{message}</p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground border border-border rounded-lg px-4 py-3 bg-muted/40">
                                Sign in again to refresh your session and gain full access.
                            </p>
                            <Link to="/auth">
                                <Button className="w-full rounded-full h-11">
                                    Sign in
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button variant="ghost" className="w-full rounded-full h-11 text-muted-foreground">
                                    Go to homepage
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {/* ── Error ── */}
                {status === "error" && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                                <XCircle className="h-9 w-9 text-destructive" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-destructive mb-3">
                                Failed
                            </p>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Verification{" "}
                                <span className="italic font-light">failed.</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">{message}</p>
                        </div>
                        <div className="space-y-3">
                            <Link to="/profile">
                                <Button className="w-full rounded-full h-11">
                                    Resend verification email
                                </Button>
                            </Link>
                            <Link to="/auth">
                                <Button variant="outline" className="w-full rounded-full h-11">
                                    Back to sign in
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {/* ── No token ── */}
                {status === "no-token" && (
                    <>
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <MailCheck className="h-9 w-9 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Invalid{" "}
                                <span className="italic font-light">link.</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                No verification token was found. Please use the link from your email.
                            </p>
                        </div>
                        <Link to="/">
                            <Button variant="outline" className="w-full rounded-full h-11">
                                Back to homepage
                            </Button>
                        </Link>
                    </>
                )}

            </div>
        </div>
    )
}
