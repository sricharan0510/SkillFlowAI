import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle, CheckCircle, Monitor, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import '../../../App.css';
import { getExamWithAnswers, saveExamResult } from '../../../services/examApi';

const ExamPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = location.state || {};

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [visited, setVisited] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const examFinishedRef = useRef(false);
  const fullscreenLockedRef = useRef(false);

  const hasAnswered = (id) => Object.prototype.hasOwnProperty.call(answers, id);

  useEffect(() => {
    if (!examId) {
      setError("No exam ID provided");
      setLoading(false);
      return;
    }

    const fetchExam = async () => {
      try {
        const response = await getExamWithAnswers(examId);
        if(response.exam.result && response.exam.result.isCompleted) {
             navigate(`/dashboard/exams/results/${examId}`, {
                state: { resultData: response.exam.result }
             });
             return;
        }

        setExamData(response.exam);
        setTimeLeft(response.exam.questions.length * 60);
      } catch (err) {
        console.error("Failed to fetch exam:", err);
        if (err.response && (err.response.status === 403 || err.response.data.isCompleted)) {
            navigate('/dashboard/exams'); 
        } else {
            setError("Failed to load exam");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, navigate]);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'p')) {
        e.preventDefault();
        alert("Copying, Pasting, and Viewing Source are disabled during the exam.");
      }
    };

    const handleFullscreenChange = () => {
      if (examStarted && !document.fullscreenElement && fullscreenLockedRef.current) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err) => {
            console.log("Could not re-enter fullscreen:", err);
          });
        }
      }
    };

    const handleBeforeUnload = (e) => {
      if (examStarted && !examFinishedRef.current) {
        e.preventDefault();
        e.returnValue = 'You have an active exam. Are you sure you want to leave?';
        return 'You have an active exam. Are you sure you want to leave?';
      }
    };

    const handlePopState = (e) => {
      if (examStarted && !examFinishedRef.current) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        alert("You cannot go back during an active exam. Please finish the exam to exit.");
      }
    };

    if (examStarted) {
      fullscreenLockedRef.current = true;
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examStarted]);

  useEffect(() => {
    if (examData && examStarted && timeLeft > 1) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (examData && examStarted && timeLeft <= 1 && !examFinishedRef.current) {
      examFinishedRef.current = true;
      handleFinishExamInternal();
    }
  }, [examData, answers, timeLeft, markedForReview]);

  const questions = examData?.questions?.map((q, index) => ({
    ...q,
    displayId: index + 1 
  })) || [];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartExam = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        alert("Full-screen mode is required to take the exam. Please allow fullscreen and try again.");
      });
    }
    setExamStarted(true);
  };

  const handleFinishExamInternal = useCallback(async () => {
    if (!examData || !examData._id) {
      console.error("Exam data not available");
      return;
    }
    
    if(isSubmitting) return;
    setIsSubmitting(true);

    const correctAnswers = questions.filter(q => {
      if (!hasAnswered(q._id)) return false;
      if (typeof q.correct === 'boolean') {
        return answers[q._id] === q.correct;
      }
      return answers[q._id]?.toString().toLowerCase() === q.correct?.toString().toLowerCase();
    }).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    const weakAreas = questions
      .filter(q => hasAnswered(q._id) && (
        typeof q.correct === 'boolean' 
          ? answers[q._id] !== q.correct 
          : answers[q._id]?.toString().toLowerCase() !== q.correct?.toString().toLowerCase()
      ))
      .slice(0, 5);
    
    const resultData = {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: (questions.length * 60) - timeLeft,
      markedForReview: markedForReview.length,
      notAnswered: questions.length - Object.keys(answers).length,
      weakAreas,
      answers: answers, 
      allQuestions: questions,
      examId: examData._id
    };

    try {
      await saveExamResult(examData._id, resultData);
      
      examFinishedRef.current = true;
      setExamStarted(false);
      fullscreenLockedRef.current = false;
      if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
      }
      
      navigate(`/dashboard/exams/results/${examData._id}`, { state: { resultData } });

    } catch (err) {
      console.error("Failed to save result:", err);
      alert("Failed to save results. Please check your connection.");
      setIsSubmitting(false);
    } 
  }, [questions, answers, timeLeft, markedForReview, navigate, examData, isSubmitting]);

  const handleFinishExam = useCallback(async () => {
    await handleFinishExamInternal();
  }, [handleFinishExamInternal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard/exams')}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">Exam not found</p>
          <Button onClick={() => navigate('/dashboard/exams')}>
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  const toggleMarkForReview = (id) => {
    setMarkedForReview(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const clearResponse = (id) => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const navigateTo = (newIdx) => {
    const currentQ = questions[currentQuestion];
    if (!hasAnswered(currentQ._id) && !visited.includes(currentQ._id)) {
      setVisited(prev => [...prev, currentQ._id]);
    }
    setCurrentQuestion(newIdx);
  };

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const answeredAndMarked = questions.filter(q => hasAnswered(q._id) && markedForReview.includes(q._id)).length;
  const answeredOnly = answeredCount - answeredAndMarked;
  const notAnsweredCount = total - answeredCount;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <Monitor className="text-primary h-8 w-8" />
            <h1 className="text-2xl font-bold">Exam Instructions</h1>
          </div>
          <div className="space-y-4 text-slate-600 mb-8">
            <p className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" /> Total Duration: 30 Minutes.</p>
            <p className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" /> Full-screen mode is mandatory. You cannot exit fullscreen during the exam.</p>
            <p className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" /> Right-click and Copy/Paste are strictly prohibited.</p>
            <p className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" /> Ensure you have a stable internet connection.</p>
          </div>
          <Button onClick={handleStartExam} className="w-full py-6 text-lg rounded-xl">Start Assessment</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex flex-col">
          <h2 className="font-bold text-lg">Comprehensive Technical Assessment</h2>
          <span className="text-xs text-slate-500">SkillFlow AI Hiring 2026</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <Button variant="destructive" onClick={() => setShowConfirmFinish(true)} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Finish Exam'}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full bg-white rounded-2xl border p-10 shadow-sm relative min-h-[400px]">
            <span className="absolute top-6 left-6 text-sm font-semibold text-slate-400">
              Question {questions[currentQuestion].displayId} of {questions.length}
            </span>

            <h3 className="text-2xl font-medium mt-10 mb-8 text-slate-800">
              {questions[currentQuestion].text}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const q = questions[currentQuestion];
                
                if (q.type === 'trueFalse') {
                  return ['True', 'False'].map((opt, idx) => {
                    const val = opt === 'True';
                    const selected = hasAnswered(q._id) && answers[q._id] === val;
                    return (
                      <div
                        key={idx}
                        onClick={() => setAnswers({ ...answers, [q._id]: val })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3
                          ${selected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-600'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary' : 'border-slate-300'}`}>
                          {selected && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                        <span className="font-medium">{opt}</span>
                      </div>
                    );
                  });
                }

                if (q.type === 'shortAns') {
                  return (
                    <div className="col-span-1 md:col-span-2">
                      <textarea
                        rows={3}
                        className="w-full border rounded-lg p-3"
                        value={answers[q._id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                        placeholder="Type your answer here..."
                      />
                    </div>
                  );
                }

                if (q.type === 'fillBlanks') {
                  return (
                    <div className="col-span-1 md:col-span-2">
                      <input
                        type="text"
                        className="w-full border rounded-lg p-3"
                        value={answers[q._id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                        placeholder="Fill the blank with your answer"
                      />
                    </div>
                  );
                }

                // default MCQ
                return q.options?.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [q._id]: option })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3
                      ${hasAnswered(q._id) && answers[q._id] === option ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasAnswered(q._id) && answers[q._id] === option ? 'border-primary' : 'border-slate-300'}`}>
                      {hasAnswered(q._id) && answers[q._id] === option && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-12 flex justify-between border-t pt-8">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => toggleMarkForReview(questions[currentQuestion]._id)}
                  className={markedForReview.includes(questions[currentQuestion]._id) ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : ''}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {markedForReview.includes(questions[currentQuestion]._id) ? 'Marked' : 'Mark for Review'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={!hasAnswered(questions[currentQuestion]._id)}
                  onClick={() => clearResponse(questions[currentQuestion]._id)}
                >
                  Clear Response
                </Button>
              </div>
              <div className="space-x-4">
                <Button
                  variant="ghost"
                  disabled={currentQuestion === 0}
                  onClick={() => navigateTo(currentQuestion - 1)}
                >
                  <ChevronLeft className="mr-2" /> Previous
                </Button>
                <Button
                  disabled={currentQuestion === questions.length - 1}
                  onClick={() => navigateTo(currentQuestion + 1)}
                >
                  Next <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <aside className="w-80 bg-white border-l p-6 flex flex-col">
          <h4 className="font-bold mb-4 text-slate-700">Question Navigation</h4>
          <div className="grid grid-cols-5 gap-2 overflow-y-auto mb-6">
            {questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => navigateTo(idx)}
                className={`m-1 w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center
                  ${currentQuestion === idx ? 'ring-2 ring-black ring-offset-2 z-20' : ''}
                  ${markedForReview.includes(q._id) ? 'bg-yellow-500 text-white' :
                    hasAnswered(q._id) ? 'bg-green-500 text-white' : visited.includes(q._id) ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {q.displayId}
              </button>
            ))}
          </div>

          <div className="mt-auto border-t pt-4 space-y-2">
            <div className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-green-500 rounded mr-2" /> Answered</div>
            <div className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-yellow-500 rounded mr-2" /> Marked for Review</div>
            <div className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-red-500 rounded mr-2" /> Visited (Not Answered)</div>
            <div className="flex items-center text-xs text-slate-500"><div className="w-3 h-3 bg-slate-100 rounded mr-2" /> Not Visited</div>
            <div className="pt-4 font-bold text-center border-t">
              {Object.keys(answers).length} of {questions.length} Answered
            </div>
          </div>
        </aside>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmFinish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl text-center">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Confirm Submission</h3>
              <div className="text-slate-600 mb-6 space-y-3 text-left">
                <div>Total Questions: <span className="font-medium">{total}</span></div>
                <div>Answered: <span className="font-medium">{answeredCount}</span> (<span className="font-medium">{answeredOnly}</span> answered only)</div>
                <div>Marked for Review: <span className="font-medium">{markedCount}</span></div>
                <div>Answered & Marked: <span className="font-medium">{answeredAndMarked}</span></div>
                <div>Not Answered: <span className="font-medium">{notAnsweredCount}</span></div>
                <div className="text-xs text-slate-400 mt-2">Once submitted, you cannot change your answers.</div>
              </div>
              <div className="flex flex-col space-y-3">
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleFinishExam} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Yes, Finish Exam'}
                </Button>
                <Button variant="ghost" onClick={() => setShowConfirmFinish(false)} disabled={isSubmitting}>Back to Exam</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPortal;