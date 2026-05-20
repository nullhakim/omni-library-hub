import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosInstance from "@/api/axiosInstance"
import { toast } from "sonner"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast.error("Please enter your email address")
            return
        }

        setStatus("loading")
        setErrorMsg("")
        try {
            await axiosInstance.post("/api/auth/forgot-password", { email })
            setStatus("success")
        } catch (err: any) {
            setStatus("idle")
            const msg = err.response?.data?.error || err.message || "Failed to send reset link."
            setErrorMsg(msg)
            toast.error(msg)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-8">
                {status === "success" ? (
                    <div className="text-center space-y-8">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                                <CheckCircle2 className="h-9 w-9 text-accent" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">
                                Email sent
                            </p>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Check your <span className="italic font-light">inbox.</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                            </p>
                        </div>
                        <div className="space-y-3 pt-4">
                            <Link to="/auth">
                                <Button variant="outline" className="w-full rounded-full h-11">
                                    Back to sign in
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 text-center">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <Mail className="h-9 w-9 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Forgot <span className="italic font-light">password?</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === "loading"}
                                    className="h-12"
                                />
                                {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full rounded-full h-12" 
                                disabled={status === "loading" || !email}
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending…
                                    </>
                                ) : (
                                    "Reset password"
                                )}
                            </Button>
                        </form>

                        <div className="text-sm text-muted-foreground pt-4">
                            Remember your password?{" "}
                            <Link to="/auth" className="text-foreground hover:underline underline-offset-4">
                                Sign in
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
