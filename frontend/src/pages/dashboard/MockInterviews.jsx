import React, { useState } from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { 
  Mic, 
  UploadCloud, 
  Library, 
  Briefcase, 
  FileText, 
  History, 
  CheckCircle2, 
  ChevronRight,
  User
} from "lucide-react";

export default function MockInterviews() {
  const [resumeSource, setResumeSource] = useState("upload"); 
  const [selectedResume, setSelectedResume] = useState(null);
  const [interviewMode, setInterviewMode] = useState("technical"); 

  const libraryResumes = [
    "Sricharan_Frontend_Resume.pdf",
    "Sricharan_FullStack_v2.pdf", 
    "General_CV_2025.pdf"
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        <div className="lg:col-span-2 space-y-8">
          
          <div className="border-b border-border pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Interview Simulator</h1>
            <p className="text-muted-foreground mt-1">Configure your session parameters and AI persona.</p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-8">
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Target Role
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior React Developer" 
                    className="w-full mt-2 p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Description (JD)</label>
                  <textarea 
                    placeholder="Paste the Job Description here to tailor the questions..." 
                    className="w-full mt-2 p-3 bg-background border border-border rounded-lg h-32 resize-none outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="h-px bg-border w-full"></div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" /> Resume Context
              </h2>
              
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setResumeSource("upload")}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${resumeSource === "upload" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Upload New
                </button>
                <button 
                  onClick={() => setResumeSource("library")}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${resumeSource === "library" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Select from Library
                </button>
              </div>

              {resumeSource === "upload" ? (
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition cursor-pointer">
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click to upload PDF</p>
                  <p className="text-xs text-muted-foreground">Max 5MB</p>
                </div>
              ) : (
                <div className="border border-border rounded-xl max-h-48 overflow-y-auto divide-y divide-border">
                  {libraryResumes.map((file, i) => (
                    <div 
                      key={i}
                      onClick={() => setSelectedResume(file)}
                      className={`p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition ${selectedResume === file ? "bg-muted" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Library className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file}</span>
                      </div>
                      {selectedResume === file && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border w-full"></div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" /> Session Mode
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <ModeCard 
                  label="Technical (TR)" 
                  active={interviewMode === 'technical'} 
                  onClick={() => setInterviewMode('technical')}
                />
                <ModeCard 
                  label="HR Round" 
                  active={interviewMode === 'hr'} 
                  onClick={() => setInterviewMode('hr')}
                />
                <ModeCard 
                  label="Combined (TR + HR)" 
                  active={interviewMode === 'combined'} 
                  onClick={() => setInterviewMode('combined')}
                />
              </div>
            </div>

            <button className="w-full bg-foreground text-background py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4">
              <Mic className="h-5 w-5" /> Initialize Interview
            </button>

          </div>
        </div>

        <div className="space-y-6">
          
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Sessions
            </h3>

            <div className="space-y-6 relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border"></div>

              <HistoryItem 
                role="Frontend Developer"
                date="Yesterday"
                score="8.5"
                mode="Technical"
              />

              <HistoryItem 
                role="Java Backend"
                date="Dec 18"
                score="6.0"
                mode="Combined"
              />

              <HistoryItem 
                role="Internship"
                date="Dec 15"
                score="7.2"
                mode="HR"
              />
            </div>
            
            <button className="w-full mt-8 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">
              View All History
            </button>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <h4 className="font-semibold text-sm mb-2">Pro Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ensure your Job Description matches your Resume skills. 
              The AI aligns questions to find gaps between what you claim and what the job needs.
            </p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}


function ModeCard({ label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer text-center py-3 px-2 rounded-lg border transition-all duration-200
      ${active 
        ? "bg-foreground text-background border-foreground font-semibold shadow-md" 
        : "bg-background border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
      }`}
    >
      <span className="text-sm">{label}</span>
    </div>
  )
}

function HistoryItem({ role, date, score, mode }) {
  return (
    <div className="relative pl-10 group cursor-pointer">
      <div className="absolute left-2 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-muted-foreground group-hover:bg-foreground transition-colors z-10"></div>
      
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-semibold group-hover:underline">{role}</span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span className="uppercase tracking-wider text-[10px] border border-border px-1.5 rounded">{mode}</span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-foreground" style={{ width: `${parseFloat(score) * 10}%` }}></div>
        </div>
        <span className="text-xs font-bold">{score}</span>
      </div>
    </div>
  )
}