import React, { useState } from "react";
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import { 
  UploadCloud, 
  Library, 
  CheckCircle2, 
  Play, 
  Clock, 
  BrainCircuit, 
  Target, 
  BookOpen, 
  History,
  AlertCircle
} from "lucide-react";

export default function ExamHall() {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState("upload"); 
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [config, setConfig] = useState({
    scope: "entire", 
    specificTopic: "",
    difficulty: "mixed", 
    questionTypes: {
      mcq: true,
      trueFalse: false,
      fillBlanks: false,
      shortAns: false,
    },
    mode: "exam", 
    includePastMistakes: false,
  });

  const toggleQType = (type) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: { ...prev.questionTypes, [type]: !prev.questionTypes[type] }
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Exam Configuration</h1>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Step {step} of 2
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
            
            <div className="h-1 w-full bg-muted">
              <div className={`h-full bg-primary transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
            </div>

            <div className="p-8 min-h-[500px]">
              
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Select Material
                  </h2>

                  <div className="flex gap-4 p-1 bg-muted/50 rounded-lg w-fit">
                    <button 
                      onClick={() => setSource("upload")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${source === "upload" ? "bg-white shadow text-black dark:text-black" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Upload New
                    </button>
                    <button 
                      onClick={() => setSource("library")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${source === "library" ? "bg-white shadow text-black dark:text-black" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Select from Library
                    </button>
                  </div>

                  {source === "upload" ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-muted/20 transition cursor-pointer group">
                      <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-lg">Drop your PDF here</h3>
                      <p className="text-sm text-muted-foreground mt-1">Supports PDF, DOCX (Max 10MB)</p>
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl max-h-64 overflow-y-auto p-2 space-y-2">
                        {["Data_Structures.pdf", "React_v18_Notes.pdf", "OS_Unit_1.pdf"].map((file, i) => (
                          <div 
                            key={i}
                            onClick={() => setSelectedFile(file)}
                            className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition border ${selectedFile === file ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted"}`}
                          >
                            <div className="flex items-center gap-3">
                                <Library className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{file}</span>
                            </div>
                            {selectedFile === file && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                        ))}
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <button 
                        onClick={() => setStep(2)}
                        disabled={source === 'library' && !selectedFile}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition"
                    >
                        Next: Configure Exam
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Scope</label>
                        <select 
                            className="w-full p-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            onChange={(e) => setConfig({...config, scope: e.target.value})}
                        >
                            <option value="entire">Entire Content</option>
                            <option value="specific">Specific Chapter/Topic</option>
                        </select>
                        {config.scope === 'specific' && (
                            <input 
                                type="text" 
                                placeholder="e.g. 'Binary Trees'" 
                                className="w-full mt-2 p-2.5 bg-background border border-border rounded-lg text-sm outline-none"
                            />
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Difficulty</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['easy', 'medium', 'hard', 'mixed'].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setConfig({...config, difficulty: lvl})}
                                    className={`py-2 rounded-lg text-xs font-bold capitalize border transition
                                    ${config.difficulty === lvl 
                                        ? "bg-primary text-primary-foreground border-primary" 
                                        : "bg-background border-border hover:border-primary/50 text-muted-foreground"}`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Question Types</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <QTypeCheckbox label="Multiple Choice" checked={config.questionTypes.mcq} onChange={() => toggleQType('mcq')} />
                        <QTypeCheckbox label="True / False" checked={config.questionTypes.trueFalse} onChange={() => toggleQType('trueFalse')} />
                        <QTypeCheckbox label="Fill in Blanks" checked={config.questionTypes.fillBlanks} onChange={() => toggleQType('fillBlanks')} />
                        <QTypeCheckbox label="Short Answer" checked={config.questionTypes.shortAns} onChange={() => toggleQType('shortAns')} />
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-purple-600" />
                        Smart Features
                    </h3>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Spaced Repetition</p>
                            <p className="text-xs text-muted-foreground">Prioritize questions I got wrong previously.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            className="toggle"
                            checked={config.includePastMistakes}
                            onChange={(e) => setConfig({...config, includePastMistakes: e.target.checked})} 
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                        <div>
                            <p className="text-sm font-medium">Exam Mode</p>
                            <p className="text-xs text-muted-foreground">
                                {config.mode === 'exam' ? 'Timer ON • No hints • Results at end' : 'Timer OFF • Instant answers • Practice'}
                            </p>
                        </div>
                        <div className="flex bg-muted rounded-lg p-1">
                            <button 
                                onClick={() => setConfig({...config, mode: 'exam'})}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${config.mode === 'exam' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
                            >
                                Exam
                            </button>
                            <button 
                                onClick={() => setConfig({...config, mode: 'practice'})}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${config.mode === 'practice' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'}`}
                            >
                                Practice
                            </button>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted">
                        Back
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:shadow-lg transition hover:-translate-y-0.5">
                        <Play className="h-4 w-4 fill-current" /> Generate Exam
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">

            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Weak Areas
                </h3>
                <div className="space-y-3">
                    <div className="text-sm p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                        <span className="font-medium text-red-700 dark:text-red-400">Binary Search Trees</span>
                        <p className="text-xs text-muted-foreground mt-1">Failed 3 times recently</p>
                    </div>
                    <div className="text-sm p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                        <span className="font-medium text-red-700 dark:text-red-400">React useEffect</span>
                        <p className="text-xs text-muted-foreground mt-1">Confused dependency arrays</p>
                    </div>
                </div>
                <button className="w-full mt-4 text-xs font-medium text-primary hover:underline">
                    Create Remedial Quiz →
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <History className="h-4 w-4" /> History
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                            <div>
                                <p className="font-medium">OS - Unit 4</p>
                                <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                            <span className="font-bold text-green-600">85%</span>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 text-xs font-medium text-primary hover:underline">
                    View All →
                </button>
            </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

function QTypeCheckbox({ label, checked, onChange }) {
    return (
        <div 
            onClick={onChange}
            className={`cursor-pointer p-3 border rounded-lg flex items-center justify-between transition-all
            ${checked ? "bg-primary/5 border-primary" : "border-border hover:border-primary/50"}`}
        >
            <span className={`text-sm font-medium ${checked ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            <div className={`h-4 w-4 rounded border flex items-center justify-center 
                ${checked ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                {checked && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
        </div>
    )
}