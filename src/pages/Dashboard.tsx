/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserBookResponse } from "@/types/api"
import axiosInstance from "@/api/axiosInstance"

export default function Dashboard() {
    const navigate = useNavigate()
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    const [isbn, setIsbn] = useState("")
    const [loadingFetch, setLoadingFetch] = useState(false)
    const [myLibrary, setMyLibrary] = useState<UserBookResponse[]>([])
    const [loadingLibrary, setLoadingLibrary] = useState(true)

    useEffect(() => {
        if (!token) navigate("/auth")
    }, [token, navigate])

    const fetchMyLibrary = async () => {
        try {
            const response = await axiosInstance.get('/api/library/')
            setMyLibrary(response.data.data || [])
        } catch {
            // silent
        } finally {
            setLoadingLibrary(false)
        }
    }

    useEffect(() => {
        if (token) fetchMyLibrary()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const handleFetchBookAPI = async () => {
        if (!isbn) return toast.error("ISBN is required")
        setLoadingFetch(true)
        try {
            await axiosInstance.post('/api/books/fetch', { isbn })
            toast.success("Book added to the catalog.")
            setIsbn("")
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        } finally {
            setLoadingFetch(false)
        }
    }

    if (!token) return null

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
            <header className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Your shelf</p>
                <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05]">
                    What you're <span className="italic font-light">reading.</span>
                </h1>
            </header>

            {/* Add by ISBN */}
            <section className="border border-border rounded-lg p-6 md:p-8 bg-card max-w-2xl">
                <h2 className="font-display text-xl mb-1">Add a book by ISBN</h2>
                <p className="text-sm text-muted-foreground mb-5">Pull metadata from Google Books into the catalog.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="isbn" className="sr-only">ISBN</Label>
                        <Input id="isbn" placeholder="e.g. 9780143127741" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="h-11" />
                    </div>
                    <Button onClick={handleFetchBookAPI} disabled={loadingFetch || !isbn} className="rounded-full h-11 px-6">
                        {loadingFetch ? "Fetching…" : "Fetch"}
                    </Button>
                </div>
            </section>

            {/* Library list */}
            <section>
                <div className="flex items-baseline justify-between mb-8 border-b border-border pb-4">
                    <h2 className="font-display text-2xl">My books</h2>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {myLibrary.length} {myLibrary.length === 1 ? "title" : "titles"}
                    </span>
                </div>

                {loadingLibrary ? (
                    <p className="text-muted-foreground text-sm">Loading…</p>
                ) : myLibrary.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground mb-4">Your shelf is empty.</p>
                        <Link to="/catalog">
                            <Button variant="outline" className="rounded-full">Browse the catalog</Button>
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {myLibrary.map((item) => {
                            const pct = item.book?.page_count
                                ? Math.round((item.current_page / item.book.page_count) * 100)
                                : 0
                            return (
                                <li key={item.id}>
                                    <Link to={`/library/${item.id}`} className="grid grid-cols-12 gap-6 py-6 group items-center">
                                        <div className="col-span-2 sm:col-span-1">
                                            <div className="aspect-[2/3] bg-muted overflow-hidden rounded-sm">
                                                {item.book?.cover_url ? (
                                                    <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="col-span-7 sm:col-span-6">
                                            <h3 className="font-display text-lg leading-snug group-hover:underline underline-offset-4 decoration-1 line-clamp-1">
                                                {item.book?.title || "Untitled"}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                {item.book?.authors?.join(", ")}
                                            </p>
                                        </div>
                                        <div className="col-span-3 sm:col-span-3">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</p>
                                            <p className="text-sm">{item.status}</p>
                                        </div>
                                        <div className="hidden sm:block sm:col-span-2 text-right">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Progress</p>
                                            <p className="font-display text-base">{pct}%</p>
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>
        </div>
    )
}
