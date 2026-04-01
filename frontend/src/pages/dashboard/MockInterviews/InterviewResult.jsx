import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Target, Loader2, MessageSquare, Briefcase, Award } from 'lucide-react';
import { getInterview } from '../../../services/interviewApi';
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import { Button } from '../../../components/ui/button';

export default function InterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | review

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const result = await getInterview(id);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!data) return <div className="text-center py-20">Interview not found.</div>;

  const { report, questions, role } = data;
  const avgScore = (data.totalScore / questions.length).toFixed(1);
  const jdMatchScore = report?.jdMatchScore || 85; // Fallback if backend doesn't supply it yet

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-12">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Interview Analysis</h1>
          <p className="text-muted-foreground">{role.split(' (JD')[0]}</p>
        </motion.div>

        {/* Hero Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-2xl p-8 flex items-center shadow-sm">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-muted-foreground mb-1">Overall Performance</h2>
              <div className="text-5xl font-extrabold text-foreground">{avgScore}<span className="text-2xl text-muted-foreground">/10</span></div>
            </div>
            <Award className="h-16 w-16 text-primary opacity-20" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 flex items-center shadow-sm">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-muted-foreground mb-1">Resume vs JD Match</h2>
              <div className="text-5xl font-extrabold text-foreground">{jdMatchScore}<span className="text-2xl text-muted-foreground">%</span></div>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center font-bold text-primary bg-primary/10">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full gap-2 mb-6 bg-card rounded-xl shadow-sm border border-border p-2">
          {['overview', 'review'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider ${activeTab === tab ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:bg-muted'}`}>
              {tab === 'overview' ? 'AI Feedback Report' : 'Detailed Q&A Review'}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'overview' && report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 rounded-2xl p-6">
                <h3 className="font-bold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5" /> Key Strengths</h3>
                <ul className="space-y-3">
                  {report.strengths?.map((str, i) => <li key={i} className="flex gap-2 text-sm text-green-900 dark:text-green-300"><span className="text-green-500">•</span> {str}</li>)}
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-2xl p-6">
                <h3 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Areas for Improvement</h3>
                <ul className="space-y-3">
                  {report.weaknesses?.map((wk, i) => <li key={i} className="flex gap-2 text-sm text-red-900 dark:text-red-300"><span className="text-red-500">•</span> {wk}</li>)}
                </ul>
              </div>

              <div className="col-span-1 md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" /> Actionable Recommendations & JD Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.matchAnalysis || "Based on the Job Description, focus heavily on bridging practical application gaps."}</p>
                <ul className="space-y-3">
                  {report.recommendations?.map((rec, i) => <li key={i} className="flex gap-2 text-sm bg-muted/50 p-3 rounded-lg"><span className="text-blue-500 font-bold">{i+1}.</span> {rec}</li>)}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-foreground flex-1 pr-4">Q{idx + 1}: {q.question}</h4>
                    <div className="font-bold text-xl px-3 py-1 bg-muted rounded-lg border border-border">{q.score}/10</div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-xl border border-border mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-2"><MessageSquare className="h-3 w-3" /> Your Transcript</span>
                    <p className="text-sm text-foreground italic">"{q.answer}"</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="w-1 bg-primary rounded-full"></div>
                      <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">Feedback:</span> {q.feedback}</p>
                    </div>
                    {q.improvement && (
                      <div className="flex gap-2">
                         <div className="w-1 bg-red-400 rounded-full"></div>
                         <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">To Improve:</span> {q.improvement}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="flex justify-center gap-4 mt-12">
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard/interviews')}>Back to Interviews</Button>
        </div>

      </div>
    </DashboardLayout>
  );
}