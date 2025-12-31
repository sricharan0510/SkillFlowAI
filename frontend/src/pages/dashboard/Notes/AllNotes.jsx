import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import { Search, FileText, Calendar, ArrowRight, Loader2, Download, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { getMaterials } from "../../../services/materialApi";
import { deleteMaterial } from "../../../services/materialApi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react'
import { useAuth } from "../../../contexts/AuthContext";

export default function AllNotes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { accessToken, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!accessToken) {
            navigate('/signin');
            return;
        }

        async function fetchNotes() {
            try {
                const data = await getMaterials("notes");
                setNotes(data.materials || []);
            } catch (error) {
                console.error("Failed to load notes", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotes();
    }, [authLoading, accessToken]);

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/dashboard/summaries')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Generator
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Smart Notes Library</h1>
                        <p className="text-muted-foreground">Browse all your AI-generated summaries.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Document Title</th>
                                    <th className="px-6 py-4">Created Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredNotes.length > 0 ? (
                                    filteredNotes.map((note) => (
                                        <tr key={note._id} className="hover:bg-muted/30 transition group cursor-pointer" onClick={() => navigate(`/dashboard/summaries/${note._id}`)}>
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                {note.title}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {note.summary ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Ready
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Processing
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            // If we have a generated summary, create PDF client-side (same approach as NoteDetail)
                                                            if (note.summary) {
                                                                const doc = new jsPDF();
                                                                const margin = 10;
                                                                const pageWidth = doc.internal.pageSize.getWidth();
                                                                const pageHeight = doc.internal.pageSize.getHeight();

                                                                doc.setFontSize(20);
                                                                const title = note.title || "Document";
                                                                doc.text(title, margin, 20);
                                                                doc.setFontSize(10);
                                                                doc.text(`Generated on ${new Date(note.createdAt).toLocaleDateString()}`, margin, 30);
                                                                doc.setFontSize(12);

                                                                const cleanText = note.summary.replace(/[#*`]/g, "");
                                                                const wrapped = doc.splitTextToSize(cleanText, pageWidth - margin * 2);

                                                                let y = 40;
                                                                const lineHeight = 7;
                                                                for (let i = 0; i < wrapped.length; i++) {
                                                                    if (y + lineHeight > pageHeight - margin) {
                                                                        doc.addPage();
                                                                        y = margin + 10;
                                                                    }
                                                                    doc.text(wrapped[i], margin, y);
                                                                    y += lineHeight;
                                                                }

                                                                const safeTitle = (note.title || 'download').replace(/[\\/:*?"<>|]/g, "-");
                                                                doc.save(`${safeTitle}.pdf`);
                                                                return;
                                                            }

                                                            // Fallback: download original file
                                                            const res = await fetch(note.fileUrl);
                                                            const blob = await res.blob();
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            const filename = note.title ? `${note.title}.pdf` : 'download.pdf';
                                                            a.download = filename;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            a.remove();
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (err) {
                                                            console.error('Download failed', err);
                                                            alert('Download failed');
                                                        }
                                                    }}
                                                    className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                                                    title="Download"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const confirmDelete = window.confirm('Are you sure you want to delete this material?');
                                                        if (!confirmDelete) return;
                                                        try {
                                                            await deleteMaterial(note._id);
                                                            setNotes(prev => prev.filter(n => n._id !== note._id));
                                                        } catch (err) {
                                                            console.error('Delete failed', err);
                                                            alert(err?.message || 'Delete failed');
                                                        }
                                                    }}
                                                    className="text-destructive hover:text-destructive/90 p-1 rounded-md"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12 text-muted-foreground">
                                            No notes found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}