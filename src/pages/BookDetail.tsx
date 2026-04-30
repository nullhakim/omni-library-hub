/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/api/axiosInstance"
import type { Book, SuccessResponse } from "@/types/api"

export default function BookDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    useEffect(() => {
        const fetchBookDetail = async () => {
            try {
                const response = await axiosInstance.get<SuccessResponse<Book>>(`/api/books/${id}`)
                setBook(response.data.data)
            } catch (err: any) {
                toast.error(err.response?.data?.error || "Could not load book")
                navigate("/catalog")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchBookDetail()
    }, [id, navigate])

    const handleAddToLibrary = async () => {
        if (!token) return toast.error("Please sign in first.")
        try {
            await axiosInstance.post('/api/library/', { book_id: id })
            toast.success("Added to your shelf.")
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        }
    }

    if (loading) return <div className="py-32 text-center text-muted-foreground text-sm">Loading…</div>
    if (!book) return null

    const publishYear = new Date(book.published_date).getFullYear()

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
            <button
                onClick={() => navigate(-1)}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-12"
            >
                ← Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                <div className="md:col-span-4">
                    <div className="aspect-[2/3] bg-muted overflow-hidden rounded-sm">
                        {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No cover</div>
                        )}
                    </div>
                    <div className="mt-6">
                        {token ? (
                            <Button className="w-full rounded-full h-11" onClick={handleAddToLibrary}>
                                Save to shelf
                            </Button>
                        ) : (
                            <Link to="/auth">
                                <Button variant="outline" className="w-full rounded-full h-11">Sign in to save</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="md:col-span-8">
                    <p className="text-sm text-muted-foreground mb-3">{book.authors?.join(", ")}</p>
                    <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.1] mb-10">
                        {book.title}
                    </h1>

                    <dl className="grid grid-cols-3 gap-6 py-6 border-y border-border mb-10">
                        <Meta label="Year" value={publishYear || "—"} />
                        <Meta label="Pages" value={book.page_count || "—"} />
                        <Meta label="ISBN" value={book.isbn || "—"} />
                    </dl>

                    <div className="space-y-4">
                        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Synopsis</h2>
                        <p className="text-foreground/85 leading-[1.8] whitespace-pre-line">
                            {book.description || "No description available."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</dt>
            <dd className="font-display text-lg">{value}</dd>
        </div>
    )
}
