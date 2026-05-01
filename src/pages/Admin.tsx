/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import axiosInstance from "@/api/axiosInstance"
import type { Book, PaginatedResponse } from "@/types/api"
import { isAdmin, getAccessToken } from "@/lib/auth"

interface BookFormState {
    title: string
    isbn: string
    authors: string // comma-separated for input
    description: string
    cover_url: string
    published_date: string
    page_count: number
}

const emptyForm: BookFormState = {
    title: "",
    isbn: "",
    authors: "",
    description: "",
    cover_url: "",
    published_date: "",
    page_count: 0,
}

export default function Admin() {
    const navigate = useNavigate()
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<BookFormState>(emptyForm)

    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        if (!getAccessToken()) {
            navigate("/auth")
            return
        }
        if (!isAdmin()) {
            toast.error("Admins only.")
            navigate("/")
        }
    }, [navigate])

    const fetchBooks = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get<PaginatedResponse<Book>>("/api/books")
            setBooks(response.data.data || [])
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin()) fetchBooks()
    }, [])

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setDialogOpen(true)
    }

    const openEdit = (book: Book) => {
        setEditingId(book.id)
        setForm({
            title: book.title || "",
            isbn: book.isbn || "",
            authors: (book.authors || []).join(", "),
            description: book.description || "",
            cover_url: book.cover_url || "",
            published_date: book.published_date || "",
            page_count: book.page_count || 0,
        })
        setDialogOpen(true)
    }

    const buildPayload = () => ({
        title: form.title.trim(),
        isbn: form.isbn.trim(),
        authors: form.authors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        description: form.description,
        cover_url: form.cover_url.trim(),
        published_date: form.published_date.trim(),
        page_count: Number(form.page_count) || 0,
    })

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.isbn.trim()) {
            toast.error("Title and ISBN are required.")
            return
        }
        setSubmitting(true)
        try {
            const payload = buildPayload()
            if (editingId) {
                await axiosInstance.put(`/api/admin/${editingId}`, payload)
                toast.success("Book updated.")
            } else {
                await axiosInstance.post("/api/admin/manual", payload)
                toast.success("Book created.")
            }
            setDialogOpen(false)
            fetchBooks()
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await axiosInstance.delete(`/api/admin/${deleteId}`)
            toast.success("Book deleted.")
            setDeleteId(null)
            fetchBooks()
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.message)
        }
    }

    if (!isAdmin()) return null

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-4xl">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Admin</p>
                    <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05]">
                        Manage the <span className="italic font-light">catalog.</span>
                    </h1>
                </div>
                <Button onClick={openCreate} className="rounded-full h-11 px-6 self-start">
                    + New book
                </Button>
            </header>

            <section>
                <div className="flex items-baseline justify-between mb-6 border-b border-border pb-4">
                    <h2 className="font-display text-2xl">All books</h2>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {books.length} {books.length === 1 ? "title" : "titles"}
                    </span>
                </div>

                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                ) : books.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-border rounded-lg text-muted-foreground">
                        No books yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {books.map((book) => (
                            <li
                                key={book.id}
                                className="grid grid-cols-12 gap-6 py-5 items-center"
                            >
                                <div className="col-span-2 sm:col-span-1">
                                    <div className="aspect-[2/3] bg-muted overflow-hidden rounded-sm">
                                        {book.cover_url ? (
                                            <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                                        ) : null}
                                    </div>
                                </div>
                                <div className="col-span-7 sm:col-span-7">
                                    <h3 className="font-display text-lg leading-snug line-clamp-1">
                                        {book.title || "Untitled"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                        {book.authors?.join(", ") || "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">ISBN {book.isbn}</p>
                                </div>
                                <div className="col-span-3 sm:col-span-4 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(book)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full text-destructive hover:text-destructive"
                                        onClick={() => setDeleteId(book.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Create / Edit dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                            {editingId ? "Edit book" : "New book"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingId ? "Update this book's details." : "Add a book to the catalog manually."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Title" required>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </FormField>
                        <FormField label="ISBN" required>
                            <Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                        </FormField>
                        <FormField label="Authors (comma separated)" className="sm:col-span-2">
                            <Input
                                value={form.authors}
                                onChange={(e) => setForm({ ...form, authors: e.target.value })}
                                placeholder="Jane Doe, John Smith"
                            />
                        </FormField>
                        <FormField label="Cover URL" className="sm:col-span-2">
                            <Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
                        </FormField>
                        <FormField label="Published date">
                            <Input
                                value={form.published_date}
                                onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                                placeholder="2023-05-01"
                            />
                        </FormField>
                        <FormField label="Page count">
                            <Input
                                type="number"
                                min={0}
                                value={form.page_count}
                                onChange={(e) => setForm({ ...form, page_count: Number(e.target.value) })}
                            />
                        </FormField>
                        <FormField label="Description" className="sm:col-span-2">
                            <Textarea
                                rows={5}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </FormField>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="rounded-full" onClick={() => setDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button className="rounded-full" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Saving…" : editingId ? "Save changes" : "Create book"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this book?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the book from the catalog permanently. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function FormField({
    label,
    required,
    className,
    children,
}: {
    label: string
    required?: boolean
    className?: string
    children: React.ReactNode
}) {
    return (
        <div className={`space-y-2 ${className || ""}`}>
            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
        </div>
    )
}
