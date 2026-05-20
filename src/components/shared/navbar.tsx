import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isAdmin, decodeJwt, getAccessToken } from "@/lib/auth"

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const admin = token ? isAdmin() : false

    // Grab name initial from JWT for avatar pill
    const payload = token ? decodeJwt(getAccessToken()) : null
    const userName = typeof payload?.name === "string" ? payload.name : ""
    const initials = userName
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .join("") || "U"

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        navigate("/auth")
    }

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            "text-sm tracking-wide transition-colors",
            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )

    return (
        <nav className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="font-display text-xl tracking-tight">
                    Omni <span className="italic font-light">Library</span>
                </Link>

                <div className="flex gap-6 items-center">
                    <NavLink to="/catalog" className={linkClass}>Catalog</NavLink>
                    {token && (
                        <NavLink to="/dashboard" className={linkClass}>Shelf</NavLink>
                    )}
                    {admin && (
                        <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                    )}
                    {token ? (
                        <div className="flex items-center gap-3">
                            {/* Profile avatar link */}
                            <NavLink
                                to="/profile"
                                title="Your profile"
                                className={({ isActive }) =>
                                    cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-opacity ring-1",
                                        isActive
                                            ? "bg-primary text-primary-foreground ring-primary"
                                            : "bg-secondary text-secondary-foreground ring-border hover:ring-foreground/40",
                                    )
                                }
                            >
                                {initials}
                            </NavLink>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-full"
                            >
                                Sign out
                            </Button>
                        </div>
                    ) : (
                        location.pathname !== "/auth" && (
                            <Link to="/auth">
                                <Button size="sm" className="rounded-full">Sign in</Button>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    )
}
