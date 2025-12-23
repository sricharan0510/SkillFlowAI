import React from "react";
import { 
  FileText, 
  Cpu, 
  ArrowRight, 
  MoreVertical,
  BrainCircuit,
  MessagesSquare,
  Sparkles
} from "lucide-react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10 max-w-7xl mx-auto">
        
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
            
            <div className="relative z-10 p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/10 mb-4">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span>AI Engine Ready</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">
                    Hello, {user?.fullName || "Scholar"}
                </h1>
                <p className="text-lg text-primary-foreground/90 max-w-2xl leading-relaxed">
                    Select a tool below to start your session. Whether it's practicing for an exam 
                    or preparing for an interview, your AI assistant is ready.
                </p>
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    Select a Tool
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    to="/dashboard/exams"
                    icon={FileText}
                    title="Exam Hall"
                    description="Upload notes to generate quizzes and test your knowledge."
                    actionText="Enter Hall"
                    color="bg-blue-500/10 text-blue-600"
                    borderColor="hover:border-blue-500/50"
                />

                <FeatureCard 
                    to="/dashboard/summaries"
                    icon={Cpu}
                    title="Smart Notes"
                    description="Summarize entire documents or extract specific topics."
                    actionText="Open Notes"
                    color="bg-purple-500/10 text-purple-600"
                    borderColor="hover:border-purple-500/50"
                />

                <FeatureCard 
                    to="/dashboard/interviews"
                    icon={MessagesSquare}
                    title="Mock Interview"
                    description="Practice with AI using your Resume and Job Description."
                    actionText="Start Session"
                    color="bg-pink-500/10 text-pink-600"
                    borderColor="hover:border-pink-500/50"
                />
            </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
                <h3 className="text-lg font-semibold">Recent History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Activity</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                        <RecentRow name="React Quiz (Hard)" date="Today, 10:23 AM" status="Completed" icon={FileText} />
                        <RecentRow name="Java Summary" date="Yesterday, 4:00 PM" status="Saved" icon={Cpu} />
                        <RecentRow name="Interview: Frontend" date="Dec 18, 2025" status="Pending" icon={MessagesSquare} />
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

function FeatureCard({ to, icon: Icon, title, description, actionText, color, borderColor }) {
  return (
    <Link 
        to={to} 
        className={`group relative bg-card border border-border rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${borderColor}`}
    >
        <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 ${color}`}>
            <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-8 leading-relaxed">{description}</p>
        <div className="flex items-center text-sm font-bold text-primary">
            {actionText} <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
    </Link>
  );
}

function RecentRow({ name, date, status, icon: Icon }) {
    return (
        <tr className="hover:bg-muted/40">
            <td className="px-6 py-4 font-medium flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {name}
            </td>
            <td className="px-6 py-4 text-muted-foreground">{date}</td>
            <td className="px-6 py-4 text-xs font-medium uppercase text-muted-foreground">{status}</td>
        </tr>
    )
}