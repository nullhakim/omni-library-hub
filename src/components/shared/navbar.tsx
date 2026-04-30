import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

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
                    {token ? (
                        <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
                            Sign out
                        </Button>
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
