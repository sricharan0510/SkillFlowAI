import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import {
  UploadCloud, Library, CheckCircle2, Play,
  Briefcase, History, Loader2, FileText, User
} from "lucide-react";
import { uploadMaterial, getMaterials } from "../../../services/materialApi";
import { startInterviewSession, getUserInterviews } from "../../../services/interviewApi";

// FIX 1: Import useAuth to ensure tokens are ready
import { useAuth } from "../../../contexts/AuthContext";

export default function MockInterviews() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // <--- FIX 2: Destructure auth state

  const [step, setStep] = useState(1);
  const [source, setSource] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumes, setResumes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);

  const [config, setConfig] = useState({
    role: "",
    jobDescription: "",
    experience: "fresher",
    difficulty: "medium",
    number: 5
  });

  // FIX 3: Wait for authLoading to finish before fetching
  useEffect(() => {
    if (!authLoading && user) {
      loadResumes();
      loadHistory();
    }
  }, [authLoading, user]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await getMaterials("resume");
      const allMaterials = response?.materials || [];
      const strictlyResumes = allMaterials.filter(m => m.category === "resume");
      setResumes(strictlyResumes);
    } catch (error) {
      const message = error?.message || error?.response?.message || JSON.stringify(error);
      console.error("Failed to load resumes:", message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getUserInterviews();
      setInterviewHistory(data || []);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("pdf", file);
      formData.append("title", file.name);
      formData.append("category", "resume");

      const response = await uploadMaterial(formData);
      const savedMaterial = response.material || response;

      setUploadedFile(savedMaterial);
      setSelectedFile(file.name);

    } catch (error) {
      const message = error?.message || error?.response?.message || JSON.stringify(error);
      console.error("Upload failed:", message);
      alert("Failed to upload resume. " + (message || "Please check your network connection."));
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!config.role) return alert("Please enter a Target Role");

    try {
      setGenerating(true);
      const payload = {
        ...config,
        number: parseInt(config.number, 10),
        role: config.jobDescription ? `${config.role} (JD: ${config.jobDescription})` : config.role,
        resumeId: uploadedFile?._id || resumes.find(r => r.title === selectedFile)?._id
      };

      const data = await startInterviewSession(payload);
      navigate('/dashboard/interviews/start', { state: { sessionId: data.sessionId } });
    } catch (error) {
      const errorMessage = error?.error || error?.message || (typeof error === 'string' ? error : "Unknown error occurred");
      alert("Failed to initialize: " + errorMessage);
      setGenerating(false);
    }
  };

  const handleHistoryClick = (session) => {
    if (session.status === 'completed') {
      navigate(`/dashboard/interviews/results/${session._id}`);
    } else {
      navigate(`/dashboard/interviews/start`, { state: { sessionId: session._id } });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Interview Simulator</h1>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Step {step} of 2
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden relative">
            <div className="h-1 w-full bg-muted">
              <div className={`h-full bg-foreground transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
            </div>

            <div className="p-8 min-h-[500px]">

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-foreground" /> Role & JD Context
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Job Title *</label>
                      <input
                        value={config.role}
                        onChange={(e) => setConfig({ ...config, role: e.target.value })}
                        type="text"
                        placeholder="e.g. Senior React Developer"
                        className="w-full mt-2 p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-foreground/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Job Description</label>
                      <textarea
                        value={config.jobDescription}
                        onChange={(e) => setConfig({ ...config, jobDescription: e.target.value })}
                        placeholder="Paste the JD here to tailor the questions..."
                        className="w-full mt-2 p-3 bg-background border border-border rounded-lg h-32 resize-none outline-none focus:ring-2 focus:ring-foreground/20"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Experience</label>
                        <select
                          value={config.experience}
                          onChange={(e) => setConfig({ ...config, experience: e.target.value })}
                          className="w-full mt-2 p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-foreground/20"
                        >
                          <option value="fresher">Fresher</option>
                          <option value="1-3 years">1-3 Years</option>
                          <option value="3-5 years">3-5 Years</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Difficulty</label>
                        <select
                          value={config.difficulty}
                          onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                          className="w-full mt-2 p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-foreground/20"
                        >
                          <option value="basic">Basic</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Questions</label>
                        <input
                          type="number"
                          value={config.number}
                          onChange={(e) => setConfig({ ...config, number: e.target.value })}
                          min="3" max="10"
                          className="w-full mt-2 p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-foreground/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!config.role}
                      className="w-full bg-foreground text-background py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition"
                    >
                      Next: Attach Resume
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-foreground" /> Attach Resume
                  </h2>

                  <div className="flex gap-4 mb-4 border-b border-border pb-2">
                    <button onClick={() => setSource("upload")} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${source === "upload" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}>Upload New</button>
                    <button onClick={() => setSource("library")} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${source === "library" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}>From Library</button>
                  </div>

                  {source === "upload" ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-muted/20 transition cursor-pointer relative">
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} />
                      <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold">{loading ? "Uploading..." : "Click to upload Resume PDF"}</h3>
                      {uploadedFile && <p className="text-sm text-green-600 mt-2 flex items-center justify-center gap-1"><CheckCircle2 className="h-4 w-4" /> {uploadedFile.title}</p>}
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl max-h-48 overflow-y-auto divide-y divide-border">
                      {resumes.length === 0 && !loading && (
                        <p className="text-sm text-muted-foreground p-4 text-center">No resumes found in library.</p>
                      )}
                      {resumes.map((file) => (
                        <div key={file._id} onClick={() => setSelectedFile(file.title)} className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 ${selectedFile === file.title ? "bg-muted" : ""}`}>
                          <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{file.title}</span></div>
                          {selectedFile === file.title && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 pt-6">
                    <button onClick={() => setStep(1)} className="px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted">Back</button>
                    <button onClick={handleInitialize} className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50" disabled={generating || (source === 'upload' && !uploadedFile) || (source === 'library' && !selectedFile)}>
                      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 fill-current" /> Start Interview</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar History */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><History className="h-4 w-4" /> Recent Interviews</h3>
            <div className="space-y-4">
              {interviewHistory.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">No recent interviews.</p>
              )}
              {interviewHistory.slice(0, 4).map((session) => (
                <div key={session._id} onClick={() => handleHistoryClick(session)} className="flex justify-between items-start text-sm border-b border-border pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                  <div>
                    <p className="font-medium text-foreground">{session.role.split(' (JD')[0]}</p>
                    <p className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {session.status}
                    </span>
                    {session.status === 'completed' && session.report && (
                      <div className="text-xs font-bold mt-1 text-foreground">{(session.totalScore / session.questions.length).toFixed(1)}/10</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/dashboard/interviews/all')} className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition">View All History →</button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}