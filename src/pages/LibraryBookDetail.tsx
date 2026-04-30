/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axiosInstance from "@/api/axiosInstance"
import type { UserBookResponse, BookNoteResponse, SuccessResponse } from "@/types/api"

export default function LibraryBookDetail() {
    const { bookId } = useParams<{ bookId: string }>()
    const navigate = useNavigate()

    const [data, setData] = useState<UserBookResponse | null>(null)
    const [notes, setNotes] = useState<BookNoteResponse[]>([])
    const [loading, setLoading] = useState(true)

    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [editStatus, setEditStatus] = useState("")
    const [editPage, setEditPage] = useState(0)
    const [editRating, setEditRating] = useState(0)

    const [newQuote, setNewQuote] = useState("")
    const [newPageRef, setNewPageRef] = useState<number>(0)
    const [newTags, setNewTags] = useState("")

    const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
    const [editNoteId, setEditNoteId] = useState("")
    const [editNoteQuote, setEditNoteQuote] = useState("")
    const [editNotePageRef, setEditNotePageRef] = useState<number>(0)
    const [editNoteTags, setEditNoteTags] = useState("")

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const fetchData = async () => {
        try {
            const resDetail = await axiosInstance.get<SuccessResponse<UserBookResponse>>(`/api/library/${bookId}`)
            const libraryData = resDetail.data.data
            setData(libraryData)
            setEditStatus(libraryData.status)
            setEditPage(libraryData.current_page)
            setEditRating(libraryData.rating)

            const resNotes = await axiosInstance.get(`/api/library/${bookId}/notes`)
            setNotes(resNotes.data.data || [])
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Could not load data")
            navigate("/dashboard")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (bookId) fetchData()
    }, [bookId])

    const handleUpdateProgress = async () => {
        try {
            await axiosInstance.put(`/api/library/${bookId}`, {
                status: editStatus,
                current_page: editPage,
                rating: editRating,
            })
            toast.success("Progress updated.")
            setIsUpdateOpen(false)
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Update failed")
        }
    }

    const handleAddNote = async () => {
        if (!newQuote) return toast.error("Note can't be empty")
        const tagsArray = newTags.split(",").map(t => t.trim()).filter(Boolean)
        try {
            await axiosInstance.post(`/api/library/${bookId}/notes`, {
                quote: newQuote, page_reference: newPageRef, tags: tagsArray,
            })
            toast.success("Note saved.")
            setNewQuote(""); setNewTags(""); setNewPageRef(0)
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to save")
        }
    }

    const openEditNoteDialog = (note: BookNoteResponse) => {
        setEditNoteId(note.id)
        setEditNoteQuote(note.quote)
        setEditNotePageRef(note.page_reference)
        setEditNoteTags(note.tags.join(", "))
        setIsEditNoteOpen(true)
    }

    const handleUpdateNote = async () => {
        if (!editNoteQuote) return toast.error("Note can't be empty")
        const tagsArray = editNoteTags.split(",").map(t => t.trim()).filter(Boolean)
        try {
            await axiosInstance.put(`/api/library/${bookId}/notes/${editNoteId}`, {
                quote: editNoteQuote, page_reference: editNotePageRef, tags: tagsArray,
            })
            toast.success("Note updated.")
            setIsEditNoteOpen(false)
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Update failed")
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm("Delete this note?")) return
        try {
            await axiosInstance.delete(`/api/library/${bookId}/notes/${noteId}`)
            toast.success("Note deleted.")
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Delete failed")
        }
    }

    const handleRemoveFromLibrary = async () => {
        try {
            await axiosInstance.delete(`/api/library/${bookId}`)
            toast.success("Removed from your shelf.")
            navigate("/dashboard")
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to remove")
        }
    }

    if (loading) return <div className="py-32 text-center text-muted-foreground text-sm">Loading…</div>
    if (!data) return null

    const progressPercentage = data.book.page_count
        ? Math.round((data.current_page / data.book.page_count) * 100)
        : 0

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
            <button
                onClick={() => navigate("/dashboard")}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-12"
            >
                ← Back to shelf
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Left: cover + meta */}
                <aside className="md:col-span-4 space-y-6">
                    <div className="aspect-[2/3] bg-muted overflow-hidden rounded-sm">
                        {data.book.cover_url ? (
                            <img src={data.book.cover_url} alt={data.book.title} className="w-full h-full object-cover" />
                        ) : null}
                    </div>

                    <dl className="space-y-4 text-sm border-t border-border pt-6">
                        <MetaRow label="ISBN" value={data.book.isbn || "—"} />
                        <MetaRow label="Year" value={new Date(data.book.published_date).getFullYear() || "—"} />
                        <MetaRow label="Pages" value={data.book.page_count} />
                    </dl>

                    <button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-xs uppercase tracking-[0.2em] text-destructive hover:underline underline-offset-4"
                    >
                        Remove from shelf
                    </button>
                </aside>

                {/* Right: main */}
                <section className="md:col-span-8">
                    <p className="text-sm text-muted-foreground mb-3">{data.book.authors.join(", ")}</p>
                    <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.1] mb-8">
                        {data.book.title}
                    </h1>

                    {/* Progress strip */}
                    <div className="border border-border rounded-lg p-6 bg-card mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</p>
                                <p className="font-display text-lg">{data.status}</p>
                            </div>
                            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="rounded-full">Update progress</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="font-display text-2xl">Update progress</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Status</Label>
                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TO_READ">To read</SelectItem>
                                                    <SelectItem value="READING">Reading</SelectItem>
                                                    <SelectItem value="FINISHED">Finished</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Current page</Label>
                                            <Input type="number" value={editPage} onChange={(e) => setEditPage(Number(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Rating (0–5)</Label>
                                            <Input type="number" min="0" max="5" value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleUpdateProgress} className="rounded-full">Save</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 mt-4">
                            <span>{data.current_page} / {data.book.page_count} pages</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-1" />

                        <div className="mt-4 text-sm text-muted-foreground">
                            Rating <span className="text-foreground font-medium">{data.rating}/5</span>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-transparent p-0 border-b border-border rounded-none h-auto w-full justify-start gap-8">
                            <TabsTrigger
                                value="overview"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm tracking-wide"
                            >
                                Synopsis
                            </TabsTrigger>
                            <TabsTrigger
                                value="notes"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm tracking-wide"
                            >
                                Journal ({notes.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="pt-8">
                            <p className="text-foreground/85 leading-[1.8] whitespace-pre-line">
                                {data.book.description || "No description available."}
                            </p>
                        </TabsContent>

                        <TabsContent value="notes" className="pt-8 space-y-10">
                            {/* New note */}
                            <div className="border border-border rounded-lg p-6 bg-card">
                                <h3 className="font-display text-lg mb-4">A new entry</h3>
                                <textarea
                                    className="w-full p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background resize-none"
                                    placeholder="A passage worth keeping…"
                                    rows={3}
                                    value={newQuote}
                                    onChange={(e) => setNewQuote(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Page</Label>
                                        <Input type="number" value={newPageRef} onChange={(e) => setNewPageRef(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tags</Label>
                                        <Input placeholder="comma, separated" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                                    </div>
                                </div>
                                <Button className="mt-4 rounded-full" onClick={handleAddNote}>Save entry</Button>
                            </div>

                            {/* List */}
                            {notes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-12 italic font-display text-lg">
                                    No entries yet.
                                </p>
                            ) : (
                                <ul className="space-y-8">
                                    {notes.map((note) => (
                                        <li key={note.id} className="group border-l-2 border-border hover:border-foreground transition-colors pl-6 py-1">
                                            <p className="font-display text-xl italic leading-relaxed text-foreground/90">
                                                "{note.quote}"
                                            </p>
                                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>p. {note.page_reference}</span>
                                                    {note.tags.length > 0 && <span>·</span>}
                                                    <div className="flex gap-2 flex-wrap">
                                                        {note.tags.map((tag, i) => (
                                                            <span key={i} className="text-muted-foreground">#{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 text-xs uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditNoteDialog(note)} className="hover:underline underline-offset-4">Edit</button>
                                                    <button onClick={() => handleDeleteNote(note.id)} className="hover:underline underline-offset-4 text-destructive">Delete</button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </TabsContent>
                    </Tabs>
                </section>
            </div>

            {/* Edit note dialog */}
            <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">Edit entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Quote</Label>
                            <textarea
                                className="w-full p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                rows={4}
                                value={editNoteQuote}
                                onChange={(e) => setEditNoteQuote(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Page</Label>
                                <Input type="number" value={editNotePageRef} onChange={(e) => setEditNotePageRef(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Tags</Label>
                                <Input value={editNoteTags} onChange={(e) => setEditNoteTags(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditNoteOpen(false)} className="rounded-full">Cancel</Button>
                        <Button onClick={handleUpdateNote} className="rounded-full">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove book dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">Remove from shelf?</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        <p className="text-muted-foreground leading-relaxed">
                            <span className="text-foreground">{data.book.title}</span> will be removed from your shelf along with all progress, ratings, and journal entries.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-full">Cancel</Button>
                        <Button variant="destructive" onClick={handleRemoveFromLibrary} className="rounded-full">Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-baseline">
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    )
}
