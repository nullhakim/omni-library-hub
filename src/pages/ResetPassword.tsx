import { useState, useEffect } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { Loader2, KeyRound, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosInstance from "@/api/axiosInstance"
import { toast } from "sonner"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "no-token">("idle")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) setStatus("no-token")
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }
        
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setStatus("loading")
        try {
            await axiosInstance.post("/api/auth/reset-password", {
                token,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
            setStatus("success")
            toast.success("Password reset successfully")
        } catch (err: any) {
            setStatus("error")
            const errorMsg = err.response?.data?.error || err.message || "Failed to reset password."
            setMessage(errorMsg)
            toast.error(errorMsg)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-8 text-center">
                
                {/* ── No token ── */}
                {status === "no-token" && (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <XCircle className="h-9 w-9 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Invalid <span className="italic font-light">link.</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                No reset token was found. Please use the link from your email or request a new one.
                            </p>
                        </div>
                        <Link to="/forgot-password">
                            <Button variant="outline" className="w-full rounded-full h-11">
                                Request new link
                            </Button>
                        </Link>
                    </div>
                )}

                {/* ── Success ── */}
                {status === "success" && (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                                <CheckCircle2 className="h-9 w-9 text-accent" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">
                                Success
                            </p>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Password <span className="italic font-light">updated!</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                Your password has been successfully reset. You can now sign in with your new password.
                            </p>
                        </div>
                        <div className="space-y-3 pt-4">
                            <Link to="/auth">
                                <Button className="w-full rounded-full h-11">
                                    Sign in
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── Form / Error ── */}
                {(status === "idle" || status === "loading" || status === "error") && (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <KeyRound className="h-9 w-9 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <h1 className="font-display text-4xl tracking-tight leading-[1.1]">
                                Reset <span className="italic font-light">password.</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-3">
                                Enter your new password below.
                            </p>
                        </div>

                        {status === "error" && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 text-left">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 text-left">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                                    New password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={status === "loading"}
                                    className="h-12"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                                    Confirm password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={status === "loading"}
                                    className="h-12"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full rounded-full h-12 mt-2" 
                                disabled={status === "loading" || !newPassword || !confirmPassword}
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating…
                                    </>
                                ) : (
                                    "Save new password"
                                )}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
