/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "@/api/axiosInstance"
import type { TokenResponse } from "@/types/api"

export default function Auth() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAuth = async (action: 'login' | 'register') => {
        setLoading(true)
        try {
            const endpoint = action === 'login' ? '/api/auth/login' : '/api/auth/register'
            const payload = action === 'login' ? { email, password } : { name, email, password }
            const response = await axiosInstance.post(endpoint, payload)

            if (action === 'login') {
                const tokenData = response.data.data as TokenResponse
                localStorage.setItem("access_token", tokenData.access_token)
                localStorage.setItem("refresh_token", tokenData.refresh_token)
                toast.success("Welcome back.")
                navigate("/dashboard")
            } else {
                toast.success("Account created. Please sign in.")
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <Link to="/" className="font-display text-3xl tracking-tight">
                        Omni <span className="italic font-light">Library</span>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-3">
                        A quiet place for your books.
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent p-0 border-b border-border rounded-none h-auto">
                        <TabsTrigger
                            value="login"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm tracking-wide"
                        >
                            Sign in
                        </TabsTrigger>
                        <TabsTrigger
                            value="register"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm tracking-wide"
                        >
                            Create account
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-5 mt-2">
                        <Field id="email" label="Email" type="email" value={email} onChange={setEmail} />
                        <Field id="password" label="Password" type="password" value={password} onChange={setPassword} />
                        <Button className="w-full rounded-full h-11" onClick={() => handleAuth('login')} disabled={loading}>
                            {loading ? "Signing in…" : "Sign in"}
                        </Button>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-5 mt-2">
                        <Field id="name" label="Full name" value={name} onChange={setName} />
                        <Field id="email-reg" label="Email" type="email" value={email} onChange={setEmail} />
                        <Field id="password-reg" label="Password" type="password" value={password} onChange={setPassword} />
                        <Button className="w-full rounded-full h-11" onClick={() => handleAuth('register')} disabled={loading}>
                            {loading ? "Creating…" : "Create account"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function Field({ id, label, type = "text", value, onChange }: { id: string; label: string; type?: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</Label>
            <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-md bg-card" />
        </div>
    )
}
