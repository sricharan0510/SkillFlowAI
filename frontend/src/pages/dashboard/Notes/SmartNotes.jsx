import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import { UploadCloud, Layers, CheckCircle2, Loader2, FileText, AlertCircle, Search } from "lucide-react";
import { uploadMaterial, generateSummary, getMaterials } from "../../../services/materialApi";
import { useAuth } from "../../../contexts/AuthContext";

export default function SmartNotes() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [mode, setMode] = useState("entire");
    const [topic, setTopic] = useState("");

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("idle");
    const [error, setError] = useState("");

    const [recentNotes, setRecentNotes] = useState([]);
    const [sidebarSearch, setSidebarSearch] = useState("");

    const navigate = useNavigate();
    const { accessToken, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!accessToken) {
            navigate('/signin');
            return;
        }
        fetchHistory();
    }, [authLoading, accessToken]);

    const fetchHistory = async () => {
        try {
            const data = await getMaterials("notes");
            if (data && Array.isArray(data.materials)) {
                setRecentNotes(data.materials);
            } else {
                setRecentNotes([]);
            }
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit.");
                return;
            }
            setFile(selected);
            if (!title) setTitle(selected.name.replace(".pdf", ""));
            setError("");
        }
    };

    const handleGenerate = async () => {
        if (!file || !title) {
            setError("Please provide a file and a title.");
            return;
        }
        if (mode === "specific" && !topic.trim()) {
            setError("Please specify a topic.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            let finalTitle = title;
            if (mode === "specific" && topic.trim()) {
                finalTitle = `${topic} in ${title}`;
            }

            setStep("uploading");
            const formData = new FormData();
            formData.append("pdf", file);
            formData.append("title", finalTitle);
            formData.append("category", "notes");

            const uploadRes = await uploadMaterial(formData);
            const materialId = uploadRes.material._id;

            setStep("generating");
            await generateSummary(materialId, mode, topic);

            setStep("done");

            await fetchHistory();

            navigate(`/dashboard/summaries/${materialId}`);

        } catch (err) {
            console.error(err);
            const message = err?.message || err?.error || (typeof err === 'string' ? err : JSON.stringify(err));
            setError(message || "Something went wrong.");
            setStep("idle");
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = recentNotes.filter(n =>
        n.title.toLowerCase().includes(sidebarSearch.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Layers className="h-6 w-6 text-foreground" />
                            Generate Smart Notes
                        </h1>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Document Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. React Fundamentals"
                                className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-2">Upload Document</label>
                            <label className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center
                        ${file ? "border-green-500 bg-green-50/10" : "border-border hover:bg-muted/30"}`}>

                                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />

                                {file ? (
                                    <>
                                        <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                                        <p className="text-xs text-green-600 mt-1">Ready to process</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                                        <p className="text-sm font-medium text-foreground">Click to upload PDF</p>
                                        <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-3">Select Scope</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setMode("entire")}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${mode === "entire" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted"}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm">Entire Document</span>
                                        {mode === "entire" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Summarize the whole file.</p>
                                </div>

                                <div
                                    onClick={() => setMode("specific")}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${mode === "specific" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted"}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm">Specific Topic</span>
                                        {mode === "specific" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Focus on a specific chapter.</p>
                                </div>
                            </div>

                            {mode === "specific" && (
                                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Enter Topic Name</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g., 'Inheritance in Java'"
                                        className="w-full mt-2 p-3 bg-muted/30 border border-border rounded-lg outline-none focus:border-primary transition"
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle className="h-4 w-4" /> {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-foreground text-background py-3 rounded-xl font-semibold shadow transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {step === "uploading" ? "Uploading PDF..." : "AI Generating..."}
                                </>
                            ) : (
                                "Generate Summary"
                            )}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col h-full max-h-[800px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Notes</h3>
                        <button
                            onClick={() => navigate('/dashboard/summaries/all')}
                            className="text-xs text-primary font-medium hover:underline"
                        >
                            View All
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter history..."
                            value={sidebarSearch}
                            onChange={(e) => setSidebarSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs border border-border rounded-lg bg-background outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((note) => (
                                <div
                                    key={note._id}
                                    onClick={() => navigate(`/dashboard/summaries/${note._id}`)}
                                    className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition cursor-pointer group hover:border-primary/50"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm truncate pr-2 group-hover:text-primary transition-colors">{note.title}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        {note.summary ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready</span>
                                        ) : (
                                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Processing</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
                                No notes found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}