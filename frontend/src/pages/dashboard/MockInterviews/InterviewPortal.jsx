import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, AlertCircle, Loader2, Send, ChevronRight } from 'lucide-react';
import { getInterview, submitInterviewAnswer, finishInterviewSession } from '../../../services/interviewApi';

export default function InterviewPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = location.state || {};

  const [sessionData, setSessionData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard/interviews');
      return;
    }

    const fetchSession = async () => {
      try {
        const data = await getInterview(sessionId);
        if (data.status === 'completed') {
          navigate(`/dashboard/interviews/results/${sessionId}`);
          return;
        }
        setSessionData(data);
        setQuestionIndex(data.currentQuestionIndex);
        setCurrentQuestion(data.questions[data.currentQuestionIndex]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, navigate]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return alert("Please provide an answer.");
    if (isRecording) toggleRecording();

    setIsSubmitting(true);
    try {
      const data = await submitInterviewAnswer({ sessionId, answer: transcript });
      setTranscript("");

      if (data.completed) {
        await finishInterviewSession(sessionId);
        navigate(`/dashboard/interviews/results/${sessionId}`);
      } else {
        setCurrentQuestion(data.question);
        setQuestionIndex(data.index);
        setSessionData(prev => ({ ...prev, questions: prev.questions.map((q, i) => i === data.index - 1 ? { ...q, answer: transcript, feedback: data.feedback } : q) }));
      }
    } catch (error) {
      alert("Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="font-bold text-lg text-slate-800">Mock Interview Session</h2>
          <span className="text-xs text-slate-500">{sessionData?.role?.split(' (JD')[0]}</span>
        </div>
        <div className="text-sm font-bold bg-slate-100 px-4 py-2 rounded-lg text-slate-700">
          Question {questionIndex + 1} of {sessionData?.questions.length}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full bg-white rounded-2xl border p-10 shadow-sm min-h-[500px] flex flex-col">

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              {currentQuestion?.type} • {currentQuestion?.difficulty}
            </span>
            <h3 className="text-2xl font-medium mt-6 text-slate-800 leading-relaxed">
              "{currentQuestion?.question}"
            </h3>
          </div>

          <div className="flex-1 flex flex-col relative">
            <textarea 
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Click the microphone to speak, or type your answer..."
              className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 text-slate-700"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                <div className="h-2 w-2 rounded-full bg-red-500"></div> Recording
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button onClick={toggleRecording} className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isRecording ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              {isRecording ? <><MicOff className="h-5 w-5"/> Stop</> : <><Mic className="h-5 w-5"/> Speak Answer</>}
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit Answer <ChevronRight className="h-5 w-5" /></>}
            </button>
          </div>

        </motion.div>
      </main>
    </div>
  );
}