import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import { Search, ArrowLeft, Briefcase, Calendar, Eye, Activity } from "lucide-react";
import { getUserInterviews } from '../../../services/interviewApi';

export default function AllInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUserInterviews();
        setInterviews(data || []);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = interviews.filter(inv => inv.role.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <button onClick={() => navigate("/dashboard/interviews")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Setup
          </button>
          <h1 className="text-3xl font-bold mb-2">Interview History</h1>
          <p className="text-muted-foreground">Review your past performances and AI analysis.</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:max-w-md pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl text-muted-foreground">No interviews found.</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((inv) => {
              const isCompleted = inv.status === 'completed';
              const date = new Date(inv.createdAt).toLocaleDateString();
              const avgScore = isCompleted ? (inv.totalScore / inv.questions.length).toFixed(1) : null;

              return (
                <div key={inv._id} onClick={() => navigate(isCompleted ? `/dashboard/interviews/results/${inv._id}` : `/dashboard/interviews/start`, { state: { sessionId: inv._id } })} className="bg-card border border-border rounded-xl p-6 hover:shadow-md cursor-pointer transition-all flex justify-between items-center group">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{inv.role.split(' (JD')[0]}</h3>
                    <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {date}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {inv.experience}</span>
                      <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {inv.difficulty}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {inv.status}
                    </span>
                    {isCompleted && (
                      <div className="mt-2 text-sm font-bold text-foreground flex items-center gap-1">
                         Score: <span className="text-primary">{avgScore}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}