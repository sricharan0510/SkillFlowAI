import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
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
  AlertCircle,
  Loader2
} from "lucide-react";
import { uploadMaterial, getMaterials } from "../../../services/materialApi";
import { generateExam, getExam, getUserExams } from "../../../services/examApi";

export default function ExamHall() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [source, setSource] = useState("upload"); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
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
  const [examHistory, setExamHistory] = useState([]);

  useEffect(() => {
    if (source === "library") {
      loadMaterials();
    }
  }, [source]);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadExamHistory = async () => {
      try {
        const response = await getUserExams();
        setExamHistory(response.exams || []);
      } catch (error) {
        console.error("Failed to load exam history:", error);
        // keep previous data if request fails
      }
    };
    if (!authLoading && user) {
      loadExamHistory();
    }
  }, [authLoading, user]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await getMaterials("notes");
      setMaterials(response.materials || []);
    } catch (error) {
      console.error("Failed to load materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert("File size must be less than 10MB");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("title", file.name);
      formData.append("category", "exams");

      const response = await uploadMaterial(formData);
      setUploadedFile(response.material);
      setSelectedFile(file.name);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleQType = (type) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: { ...prev.questionTypes, [type]: !prev.questionTypes[type] }
    }));
  };

  const handleGenerateExam = async () => {
    try {
      setGenerating(true);
      
      let materialId;
      if (source === "upload" && uploadedFile) {
        materialId = uploadedFile._id;
      } else if (source === "library" && selectedFile) {
        // Find the material by title
        const material = materials.find(m => m.title === selectedFile);
        if (!material) {
          console.error("Selected material not found:", selectedFile);
          console.log("Available materials:", materials.map(m => m.title));
          alert("Selected material not found. Please try again.");
          return;
        }
        materialId = material._id;
      } else {
        alert("Please select or upload a material first");
        return;
      }

      console.log("Generating exam with materialId:", materialId, "config:", config);

      const response = await generateExam(materialId, config);
      console.log("Exam generation response:", response);
      
      // Poll for exam completion
      const pollExam = async (examId) => {
        try {
          console.log("Polling exam status for:", examId);
          const examResponse = await getExam(examId);
          console.log("Exam status:", examResponse.exam.status);
          
          if (examResponse.exam.status === "ready") {
            console.log("Exam ready, navigating to:", `/dashboard/exams/start`);
            setGenerating(false);
            // Use a small delay to ensure state updates before navigation
            setTimeout(() => {
              navigate('/dashboard/exams/start', { state: { examId } });
            }, 100);
          } else if (examResponse.exam.status === "failed") {
            console.error("Exam generation failed");
            alert("Failed to generate exam. Please try again.");
            setGenerating(false);
          } else {
            console.log("Still generating, polling again in 2 seconds...");
            setTimeout(() => pollExam(examId), 2000); // Poll every 2 seconds
          }
        } catch (error) {
          console.error("Polling failed:", error);
          alert("Failed to check exam status: " + error.message);
          setGenerating(false);
        }
      };

      pollExam(response.examId);
      
    } catch (error) {
      console.error("Exam generation failed:", error);
      alert("Failed to generate exam. Please try again.");
      setGenerating(false);
    }
  };

  // Bug 4 Fix: Handle Navigation based on status
  const handleExamClick = (exam) => {
     if (exam.result && exam.result.isCompleted) {
         navigate(`/dashboard/exams/results/${exam._id}`);
     } else if (exam.status === 'ready') {
         navigate(`/dashboard/exams/start`, { state: { examId: exam._id } });
     }
  };

  return (
    <DashboardLayout>
      {/* Loading Overlay - shows while exam is generating */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Generating Exam</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Our AI is creating personalized exam questions based on your material...
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                   This may take a minute. Please don't close this window.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-muted/20 transition cursor-pointer group relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                      <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
                      </div>
                      <h3 className="font-semibold text-lg">
                        {loading ? "Uploading..." : "Drop your PDF here"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {loading ? "Please wait..." : "Supports PDF, DOCX (Max 10MB)"}
                      </p>
                      {uploadedFile && (
                        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {uploadedFile.title} uploaded successfully
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl max-h-64 overflow-y-auto p-2 space-y-2">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Loading materials...
                        </div>
                      ) : materials.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No materials found. Upload some PDFs first.
                        </div>
                      ) : (
                        materials.map((material, i) => (
                          <div 
                            key={material._id}
                            onClick={() => setSelectedFile(material.title)}
                            className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition border ${selectedFile === material.title ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted"}`}
                          >
                            <div className="flex items-center gap-3">
                                <Library className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{material.title}</span>
                            </div>
                            {selectedFile === material.title && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  
                  <div className="pt-6">
                    <button 
                        onClick={() => setStep(2)}
                        disabled={
                          (source === 'upload' && !uploadedFile) || 
                          (source === 'library' && !selectedFile) ||
                          loading
                        }
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
                                className="w-full mt-2 p-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                value={config.specificTopic || ''}
                                onChange={(e) => setConfig({...config, specificTopic: e.target.value})}
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
                    <button onClick={handleGenerateExam} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={generating}>
                        {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Exam...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" /> Generate Exam
                          </>
                        )}
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
                    <History className="h-4 w-4" /> Recent Exams
                </h3>
                <div className="space-y-4">
                    {examHistory.slice(0, 3).map((exam) => {
                        const completedDate = new Date(exam.createdAt);
                        const daysAgo = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
                        const dateText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
                        const isCompleted = exam.result && exam.result.isCompleted;
                        
                        return (
                            <div 
                                key={exam._id} 
                                // BUG FIX 4: Navigate to correct page based on state
                                onClick={() => handleExamClick(exam)}
                                className="flex justify-between items-center text-sm border-b border-border last:border-0 pb-2 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                            >
                                <div>
                                    <p className="font-medium">{exam.title || exam.materialTitle}</p>
                                    <p className="text-xs text-muted-foreground">{dateText}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {exam.config?.questionTypes?.mcq && <span className="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.5 rounded">MCQ</span>}
                                        {exam.config?.questionTypes?.trueFalse && <span className="text-[10px] bg-purple-50 text-purple-700 px-1 py-0.5 rounded">T/F</span>}
                                        {exam.config?.questionTypes?.fillBlanks && <span className="text-[10px] bg-green-50 text-green-700 px-1 py-0.5 rounded">Fill</span>}
                                        {exam.config?.questionTypes?.shortAns && <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded">Short</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-medium px-2 py-1 rounded inline-block mb-1
                                        ${exam.status === 'ready' && !isCompleted ? 'bg-green-100 text-green-700' : 
                                          isCompleted ? 'bg-blue-100 text-blue-700' :
                                          exam.status === 'generating' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {isCompleted ? 'Completed' : 
                                         exam.status === 'ready' ? 'Ready' : 
                                         exam.status === 'generating' ? 'Generating...' : 'Failed'}
                                    </span>
                                    {/* BUG FIX 4: Show score if completed */}
                                    {isCompleted && (
                                        <div className="text-xs font-bold text-slate-700">
                                            Score: {exam.result.score}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button 
                    onClick={() => navigate('/dashboard/exams/all')}
                    className="w-full mt-4 text-xs font-medium text-primary hover:underline"
                >
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