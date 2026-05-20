import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Catalog from "@/pages/Catalog"
import Auth from "@/pages/Auth"
import Dashboard from "@/pages/Dashboard"
import Navbar from "./components/shared/navbar"
import { Toaster } from "@/components/ui/sonner"
import BookDetail from "./pages/BookDetail"
import LibraryBookDetail from "./pages/LibraryBookDetail"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Admin from "./pages/Admin"
import Profile from "./pages/Profile"
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import EmailVerificationBanner from "./components/shared/EmailVerificationBanner"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <EmailVerificationBanner />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/library/:bookId" element={<LibraryBookDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            {/* Email verification redirect from backend */}
            <Route path="/api/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-border mt-24">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-display text-base text-foreground">Omni Library</span>
            <span>© {new Date().getFullYear()} — A quiet place for your books.</span>
          </div>
        </footer>
        <Toaster richColors position="top-center" />
      </div>
    </Router>
  )
}

export default App

