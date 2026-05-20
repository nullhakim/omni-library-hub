/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/api/axiosInstance"
import type { UserProfile, UpdateProfileRequest, UpdatePasswordRequest } from "@/types/api"

// ── helpers ──────────────────────────────────────────────────────────────────

function Field({
    id,
    label,
    type = "text",
    value,
    onChange,
    disabled,
    hint,
}: {
    id: string
    label: string
    type?: string
    value: string
    onChange?: (v: string) => void
    disabled?: boolean
    hint?: string
}) {
    return (
        <div className="space-y-2">
            <Label
                htmlFor={id}
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground"
            >
                {label}
            </Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                className="h-11 rounded-md bg-card disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="border border-border rounded-lg p-6 md:p-8 bg-card">
            {children}
        </div>
    )
}

// ── avatar initials ───────────────────────────────────────────────────────────

function AvatarInitials({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")

    return (
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="font-display text-2xl text-primary-foreground">{initials || "?"}</span>
        </div>
    )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function Profile() {
    const navigate = useNavigate()
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    // redirect if not authenticated
    useEffect(() => {
        if (!token) navigate("/auth")
    }, [token, navigate])

    // ── profile data ──────────────────────────────────────────────────────────
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)

    const fetchProfile = async () => {
        try {
            const res = await axiosInstance.get("/api/users/me")
            setProfile(res.data.data as UserProfile)
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to load profile")
        } finally {
            setLoadingProfile(false)
        }
    }

    useEffect(() => {
        if (token) fetchProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    // ── update profile ────────────────────────────────────────────────────────
    const [profileName, setProfileName] = useState("")
    const [profileEmail, setProfileEmail] = useState("")
    const [savingProfile, setSavingProfile] = useState(false)

    // sync form when profile loads
    useEffect(() => {
        if (profile) {
            setProfileName(profile.name)
            setProfileEmail(profile.email)
        }
    }, [profile])

    const handleUpdateProfile = async () => {
        if (!profileName.trim() || !profileEmail.trim()) {
            return toast.error("Name and email are required.")
        }
        setSavingProfile(true)
        try {
            const payload: UpdateProfileRequest = { name: profileName.trim(), email: profileEmail.trim() }
            const res = await axiosInstance.put("/api/users/me", payload)
            const updated = res.data.data as UserProfile
            setProfile(updated)
            toast.success("Profile updated successfully.")
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update profile.")
        } finally {
            setSavingProfile(false)
        }
    }

    // ── update password ───────────────────────────────────────────────────────
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [savingPassword, setSavingPassword] = useState(false)

    const handleUpdatePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            return toast.error("All password fields are required.")
        }
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match.")
        }
        if (newPassword.length < 8) {
            return toast.error("New password must be at least 8 characters.")
        }
        setSavingPassword(true)
        try {
            const payload: UpdatePasswordRequest = {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }
            await axiosInstance.put("/api/users/me/password", payload)
            toast.success("Password changed successfully.")
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update password.")
        } finally {
            setSavingPassword(false)
        }
    }

    if (!token) return null

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-14">
            {/* ── Page header ── */}
            <header>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                    Account
                </p>
                <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05]">
                    Your <span className="italic font-light">profile.</span>
                </h1>
            </header>

            {/* ── Profile summary card ── */}
            {loadingProfile ? (
                <SectionCard>
                    <div className="flex items-center gap-5 animate-pulse">
                        <div className="w-20 h-20 rounded-full bg-muted" />
                        <div className="space-y-2">
                            <div className="h-5 w-40 bg-muted rounded" />
                            <div className="h-4 w-60 bg-muted rounded" />
                            <div className="h-4 w-24 bg-muted rounded" />
                        </div>
                    </div>
                </SectionCard>
            ) : profile ? (
                <SectionCard>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <AvatarInitials name={profile.name} />
                        <div className="space-y-1 flex-1">
                            <h2 className="font-display text-2xl">{profile.name}</h2>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-medium bg-secondary text-secondary-foreground border border-border">
                                    {profile.role}
                                </span>
                                {/* ── Email verified badge ── */}
                                {profile.is_email_verified ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-medium bg-accent/10 text-accent border border-accent/30">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Email verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-medium bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50">
                                        <AlertCircle className="h-3 w-3" />
                                        Email not verified
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                    Joined{" "}
                                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>

                            {/* ── Inline resend prompt when unverified ── */}
                            {!profile.is_email_verified && (
                                <ResendVerificationInline email={profile.email} />
                            )}
                        </div>
                    </div>
                </SectionCard>
            ) : null}

            {/* ── Tabs: Edit Profile / Change Password ── */}
            <Tabs defaultValue="edit-profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-10 bg-transparent p-0 border-b border-border rounded-none h-auto">
                    <TabsTrigger
                        value="edit-profile"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm tracking-wide"
                    >
                        Edit profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="change-password"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm tracking-wide"
                    >
                        Change password
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab: Edit profile ── */}
                <TabsContent value="edit-profile" className="mt-0">
                    <SectionCard>
                        <div className="mb-6">
                            <h3 className="font-display text-xl">Personal information</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Update your display name and email address.
                            </p>
                        </div>

                        <div className="space-y-5 max-w-md">
                            <Field
                                id="profile-name"
                                label="Full name"
                                value={profileName}
                                onChange={setProfileName}
                                disabled={loadingProfile}
                            />
                            <Field
                                id="profile-email"
                                label="Email address"
                                type="email"
                                value={profileEmail}
                                onChange={setProfileEmail}
                                disabled={loadingProfile}
                            />

                            <div className="pt-2 flex gap-3">
                                <Button
                                    id="btn-save-profile"
                                    onClick={handleUpdateProfile}
                                    disabled={savingProfile || loadingProfile}
                                    className="rounded-full h-11 px-8"
                                >
                                    {savingProfile ? "Saving…" : "Save changes"}
                                </Button>
                                <Button
                                    id="btn-reset-profile"
                                    variant="outline"
                                    onClick={() => {
                                        if (profile) {
                                            setProfileName(profile.name)
                                            setProfileEmail(profile.email)
                                        }
                                    }}
                                    disabled={savingProfile || loadingProfile}
                                    className="rounded-full h-11 px-8"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </SectionCard>
                </TabsContent>

                {/* ── Tab: Change password ── */}
                <TabsContent value="change-password" className="mt-0">
                    <SectionCard>
                        <div className="mb-6">
                            <h3 className="font-display text-xl">Change password</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Choose a strong password of at least 8 characters.
                            </p>
                        </div>

                        <div className="space-y-5 max-w-md">
                            <Field
                                id="current-password"
                                label="Old password"
                                type="password"
                                value={oldPassword}
                                onChange={setOldPassword}
                            />
                            <Field
                                id="new-password"
                                label="New password"
                                type="password"
                                value={newPassword}
                                onChange={setNewPassword}
                                hint="Minimum 8 characters."
                            />
                            <Field
                                id="confirm-password"
                                label="Confirm new password"
                                type="password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                            />

                            {/* password strength meter */}
                            {newPassword.length > 0 && (
                                <PasswordStrength password={newPassword} />
                            )}

                            <div className="pt-2">
                                <Button
                                    id="btn-save-password"
                                    onClick={handleUpdatePassword}
                                    disabled={savingPassword}
                                    className="rounded-full h-11 px-8"
                                >
                                    {savingPassword ? "Updating…" : "Update password"}
                                </Button>
                            </div>
                        </div>
                    </SectionCard>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// ── password strength indicator ───────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
    const score = getPasswordScore(password)
    const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"]
    const colors = [
        "bg-destructive",
        "bg-orange-400",
        "bg-yellow-400",
        "bg-accent",
        "bg-green-500",
    ]

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= score ? colors[score] : "bg-muted"
                        }`}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">{labels[score]}</p>
        </div>
    )
}

function getPasswordScore(password: string): number {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return Math.min(score, 4)
}

// ── Inline resend verification (shown inside Profile card) ────────────────────

function ResendVerificationInline({ email }: { email: string }) {
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleResend = async () => {
        setSending(true)
        try {
            await axiosInstance.post("/api/auth/resend-verification", { email })
            setSent(true)
            toast.success("Verification email sent! Check your inbox.")
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to send verification email.")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-700/50 dark:bg-amber-900/20 px-3 py-2.5">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex-1 leading-snug">
                {sent
                    ? "Email sent — check your inbox."
                    : "Didn't receive the email?"}
            </p>
            {!sent && (
                <Button
                    id="btn-resend-verification-profile"
                    size="sm"
                    variant="outline"
                    onClick={handleResend}
                    disabled={sending}
                    className="rounded-full h-7 px-3 text-[11px] gap-1.5 shrink-0 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-transparent dark:text-amber-300 dark:hover:bg-amber-900/40"
                >
                    <RefreshCw className={`h-3 w-3 ${sending ? "animate-spin" : ""}`} />
                    {sending ? "Sending…" : "Resend"}
                </Button>
            )}
        </div>
    )
}
