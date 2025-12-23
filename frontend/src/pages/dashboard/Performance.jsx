import React, { useState } from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { 
  BarChart2, 
  TrendingUp, 
  Target, 
  Clock, 
  Briefcase, 
  Mic, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

export default function Performance() {
  const [activeTab, setActiveTab] = useState("exams"); 

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your growth across quizzes and mock interviews.</p>
          </div>
        </div>

        <div className="border-b border-border">
            <div className="flex gap-8">
                <button 
                    onClick={() => setActiveTab("exams")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === "exams" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                    <BrainCircuit className="h-4 w-4" /> Exam Metrics
                </button>
                <button 
                    onClick={() => setActiveTab("interviews")}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === "interviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                    <Mic className="h-4 w-4" /> Interview Metrics
                </button>
            </div>
        </div>

        {activeTab === "exams" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard 
                        title="Questions Attempted" 
                        value="1,240" 
                        icon={Target} 
                        color="text-blue-600" bg="bg-blue-50"
                    />
                    <MetricCard 
                        title="Avg. Accuracy" 
                        value="76%" 
                        icon={CheckCircle2} 
                        color="text-green-600" bg="bg-green-50"
                    />
                    <MetricCard 
                        title="Avg. Time / Question" 
                        value="45s" 
                        icon={Clock} 
                        color="text-orange-600" bg="bg-orange-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Subject Mastery</h3>
                        <div className="space-y-6">
                            <SkillProgress label="Data Structures (Arrays, Trees)" score={85} color="bg-green-500" />
                            <SkillProgress label="React & Frontend" score={92} color="bg-green-500" />
                            <SkillProgress label="System Design" score={45} color="bg-red-500" warning="Needs Improvement" />
                            <SkillProgress label="Database Management (SQL)" score={68} color="bg-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" /> Weak Areas
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Focus on these topics to improve your score.</p>
                        
                        <div className="space-y-3">
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 rounded-lg">
                                <span className="font-semibold text-sm text-red-700">Dynamic Programming</span>
                                <p className="text-xs text-red-600/80">30% Accuracy in last 3 tests</p>
                            </div>
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 rounded-lg">
                                <span className="font-semibold text-sm text-yellow-700">React Context API</span>
                                <p className="text-xs text-yellow-600/80">Confused with Redux often</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === "interviews" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard 
                        title="Interviews Completed" 
                        value="12" 
                        icon={Briefcase} 
                        color="text-purple-600" bg="bg-purple-50"
                    />
                    <MetricCard 
                        title="Avg. Tech Score" 
                        value="7.5/10" 
                        icon={BrainCircuit} 
                        color="text-indigo-600" bg="bg-indigo-50"
                    />
                    <MetricCard 
                        title="Communication" 
                        value="9.0/10" 
                        icon={Mic} 
                        color="text-pink-600" bg="bg-pink-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Soft Skills Analysis</h3>
                        <div className="space-y-5">
                            <SkillProgress label="Confidence & Pace" score={88} color="bg-blue-500" />
                            <SkillProgress label="Answer Structure (STAR Method)" score={60} color="bg-yellow-500" warning="Try to be more concise" />
                            <SkillProgress label="Vocabulary & Tone" score={90} color="bg-green-500" />
                            <SkillProgress label="Handling Unknown Questions" score={50} color="bg-red-500" warning="Don't panic, ask for clarification" />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Performance by Role</h3>
                        <div className="space-y-4">
                            {[
                                { role: "Frontend Developer", score: "8.5", trend: "High" },
                                { role: "Backend Java", score: "6.2", trend: "Avg" },
                                { role: "HR Round", score: "9.0", trend: "High" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                                    <div>
                                        <p className="font-semibold text-sm">{item.role}</p>
                                        <p className="text-xs text-muted-foreground">{item.trend === "High" ? "Consistently Good" : "Needs Practice"}</p>
                                    </div>
                                    <div className={`text-xl font-bold ${item.score > 8 ? "text-green-600" : item.score < 7 ? "text-yellow-600" : "text-blue-600"}`}>
                                        {item.score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 flex items-start justify-between shadow-sm hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    )
}

function SkillProgress({ label, score, color, warning }) {
    return (
        <div>
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs font-bold">{score}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }}></div>
            </div>
            {warning && (
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Tip: {warning}
                </p>
            )}
        </div>
    )
}