/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import axiosInstance from "@/api/axiosInstance"
import type { Book, PaginatedResponse } from "@/types/api"
import { Link } from "react-router-dom"

export default function Catalog() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get<PaginatedResponse<Book>>('/api/books')
                setBooks(response.data.data || [])
            } catch (err: any) {
                console.error("Failed to load books:", err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchBooks()
    }, [])

    const handleAddToLibrary = async (e: React.MouseEvent, bookId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!token) return toast.error("Please sign in first.")
        try {
            await axiosInstance.post('/api/library/', { book_id: bookId })
            toast.success("Added to your shelf.")
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <header className="mb-16 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">The Catalog</p>
                <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05]">
                    Books, <span className="italic font-light">curated quietly.</span>
                </h1>
                <p className="text-muted-foreground mt-5 leading-relaxed">
                    Browse the public catalog. Save what speaks to you.
                </p>
            </header>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-3 animate-pulse">
                            <div className="aspect-[2/3] bg-muted rounded-sm" />
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground border-t border-border">
                    The shelves are empty for now.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-14">
                    {books.map((book) => (
                        <article key={book.id} className="group">
                            <Link to={`/book/${book.id}`} className="block">
                                <div className="aspect-[2/3] bg-muted overflow-hidden mb-4 rounded-sm">
                                    {book.cover_url ? (
                                        <img
                                            src={book.cover_url}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                            No cover
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-display text-lg leading-snug line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    {book.authors?.join(", ") || "Unknown"}
                                </p>
                            </Link>
                            {token && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-3 px-0 h-auto text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:bg-transparent"
                                    onClick={(e) => handleAddToLibrary(e, book.id)}
                                >
                                    + Save to shelf
                                </Button>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}
