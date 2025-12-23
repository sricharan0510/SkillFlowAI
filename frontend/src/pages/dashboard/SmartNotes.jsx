import React, { useState } from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { UploadCloud, Layers, FileText, CheckCircle2 } from "lucide-react";

export default function SmartNotes() {
  const [mode, setMode] = useState("entire"); 

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Generator Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Layers className="h-6 w-6 text-black dark:text-white" />
                    Generate Smart Notes
                </h1>

                {/* 1. Upload Section */}
                <div className="mb-8">
                    <label className="block text-sm font-medium mb-2">1. Upload Document</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/30 transition cursor-pointer">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground">Click to upload PDF</p>
                        <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
                    </div>
                </div>

                {/* 2. Scope Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium mb-3">2. Select Scope</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => setMode("entire")}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${mode === "entire" ? "border-black bg-black/5 ring-1 ring-black/10 dark:border-white dark:bg-white/5 dark:ring-white/10" : "border-border hover:border-black/10 dark:hover:border-white/10"}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">Entire Document</span>
                                {mode === "entire" && <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />}
                            </div>
                            <p className="text-xs text-muted-foreground">Summarize the whole file and extract all key concepts.</p>
                        </div>

                        <div 
                            onClick={() => setMode("specific")}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${mode === "specific" ? "border-black bg-black/5 ring-1 ring-black/10 dark:border-white dark:bg-white/5 dark:ring-white/10" : "border-border hover:border-black/10 dark:hover:border-white/10"}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">Specific Topic</span>
                                {mode === "specific" && <CheckCircle2 className="h-4 w-4 text-black dark:text-white" />}
                            </div>
                            <p className="text-xs text-muted-foreground">Focus AI on a specific chapter or concept only.</p>
                        </div>
                    </div>

                    {/* Conditional Input for Specific Topic */}
                    {mode === "specific" && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Enter Topic Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g., 'Inheritance in Java' or 'Chapter 4'" 
                                className="w-full mt-2 p-3 bg-muted/30 border border-border rounded-lg outline-none focus:border-black dark:focus:border-white transition"
                            />
                        </div>
                    )}
                </div>

                <button className="w-full bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-black py-3 rounded-xl font-semibold shadow transition-all">
                    Generate Summary
                </button>
            </div>
        </div>

        {/* RIGHT: Previous Summaries */}
        <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Smart Notes</h3>
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition cursor-pointer">
                        <h4 className="font-bold text-sm mb-1">React Hooks Guide</h4>
                        <p className="text-xs text-muted-foreground mb-3">Generated from React_Docs.pdf</p>
                        <div className="flex gap-2">
                            <span className="text-[10px] bg-black/5 dark:bg-white/5 text-black dark:text-white px-2 py-1 rounded">Full Summary</span>
                        </div>
                    </div>
                ))}
                <button className="w-full bg-primary/10 text-primary py-2 rounded-xl font-medium hover:bg-primary/20 transition">
                    View All Smart Notes
                </button>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}