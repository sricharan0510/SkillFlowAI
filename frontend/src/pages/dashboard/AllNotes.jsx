import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { Search, FileText, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { getMaterials } from "../../services/materialApi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react'
import { useAuth } from "../../contexts/AuthContext";

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
                {/* Header */}
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

                {/* Content */}
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
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                                                    Read <ArrowRight className="h-4 w-4" />
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