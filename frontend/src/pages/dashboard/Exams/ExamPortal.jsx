import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle, CheckCircle, Monitor } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import '../../../App.css';

const ExamPortal = () => {
  const navigate = useNavigate();
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [visited, setVisited] = useState([]);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const questions = [
    { id: 1, type: 'mcq', text: "What is 15 + 27?", options: ["40", "42", "44", "38"], correct: "42" },
    { id: 2, type: 'mcq', text: "Which language is used for web styling?", options: ["Python", "HTML", "CSS", "Java"], correct: "CSS" },
    { id: 3, type: 'short', text: "What does HTML stand for?", correct: "Hyper Text Markup Language" },
    { id: 4, type: 'mcq', text: "Which symbol is used for single-line comments in JavaScript?", options: ["<!-- -->", "#", "//", "/* */"], correct: "//" },
    { id: 5, text: "What is 9 × 6?", options: ["42", "54", "56", "48"], correct: "54" },
    { id: 6, text: "Which of the following is a JavaScript framework?", options: ["Django", "Laravel", "React", "Flask"], correct: "React" },
    { id: 7, text: "What keyword is used to declare a constant in JavaScript?", options: ["var", "let", "const", "static"], correct: "const" },
    { id: 8, text: "Which HTML tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], correct: "<a>" },
    { id: 9, text: "What is 100 ÷ 4?", options: ["20", "25", "30", "40"], correct: "25" },
    { id: 10, text: "Which CSS property controls text size?", options: ["font-style", "text-size", "font-size", "text-style"], correct: "font-size" },
    { id: 11, text: "Which company developed JavaScript?", options: ["Microsoft", "Sun Microsystems", "Netscape", "Oracle"], correct: "Netscape" },
    { id: 12, text: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], correct: "Cascading Style Sheets" },
    { id: 13, text: "Which operator is used for strict equality in JavaScript?", options: ["==", "=", "===", "!="], correct: "===" },
    { id: 14, type: 'short', text: "What is the result of 5 + '5' in JavaScript?", correct: "55" },
    { id: 15, text: "Which HTML tag is used for an unordered list?", options: ["<ol>", "<ul>", "<li>", "<list>"], correct: "<ul>" },
    { id: 16, text: "Which method converts JSON to a JavaScript object?", options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"], correct: "JSON.parse()" },
    { id: 17, text: "What is 7²?", options: ["14", "21", "49", "77"], correct: "49" },
    { id: 18, text: "Which CSS property is used to change text color?", options: ["font-color", "text-color", "color", "foreground"], correct: "color" },
    { id: 19, text: "Which HTML attribute is used to define inline styles?", options: ["class", "style", "font", "css"], correct: "style" },
    { id: 20, text: "Which keyword is used to define a function in JavaScript?", options: ["func", "define", "function", "method"], correct: "function" },
    { id: 21, text: "What is the output of Math.floor(4.9)?", options: ["4", "5", "4.9", "Error"], correct: "4" },
    { id: 22, text: "Which CSS property controls the spacing between elements?", options: ["padding", "margin", "spacing", "gap"], correct: "margin" },
    { id: 23, type: 'fill', text: "Fill the tag used to display an image (without angle brackets):", correct: "img" },
    { id: 24, text: "What is the default value of position in CSS?", options: ["relative", "absolute", "fixed", "static"], correct: "static" },
    { id: 25, text: "Which loop is guaranteed to run at least once?", options: ["for", "while", "do...while", "foreach"], correct: "do...while" },
    { id: 26, text: "What does DOM stand for?", options: ["Document Object Model", "Data Object Model", "Digital Ordinance Model", "Desktop Object Model"], correct: "Document Object Model" },
    { id: 27, text: "Which event occurs when a user clicks an HTML element?", options: ["onhover", "onchange", "onclick", "onmouse"], correct: "onclick" },
    { id: 28, type: 'tf', text: "2³ equals 8.", correct: true },
    { id: 29, text: "Which JavaScript method is used to select an element by ID?", options: ["querySelector()", "getElement()", "getElementById()", "selectById()"], correct: "getElementById()" },
    { id: 30, text: "Which CSS unit is relative to the root element?", options: ["em", "px", "rem", "%"], correct: "rem" }
  ];

  const [timeLeft, setTimeLeft] = useState(questions.length * 60);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Prevent ESC key to exit fullscreen
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
      // If user tries to exit fullscreen, re-enter it
      if (examStarted && !document.fullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
        }
      }
    };

    if (examStarted) {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [examStarted]);

  // Timer Logic
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleFinishExam();
    }
  }, [examStarted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartExam = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    setExamStarted(true);
  };

  const handleFinishExam = () => {
    setExamStarted(false);
    document.exitFullscreen().catch(() => { });
    
    // Calculate results
    const correctAnswers = questions.filter(q => {
      if (!hasAnswered(q.id)) return false;
      if (typeof q.correct === 'boolean') {
        return answers[q.id] === q.correct;
      }
      return answers[q.id]?.toLowerCase() === q.correct?.toLowerCase();
    }).length;
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Identify weakness areas (wrong answers)
    const weakAreas = questions
      .filter(q => hasAnswered(q.id) && (
        typeof q.correct === 'boolean' 
          ? answers[q.id] !== q.correct 
          : answers[q.id]?.toLowerCase() !== q.correct?.toLowerCase()
      ))
      .slice(0, 5); // Top 5 weakness areas
    
    const resultData = {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: (questions.length * 60) - timeLeft,
      markedForReview: markedForReview.length,
      notAnswered: questions.length - Object.keys(answers).length,
      weakAreas,
      allAnswers: answers,
      allQuestions: questions
    };
    
    navigate('/dashboard/exams/results', { state: { resultData } });
  };

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

  const hasAnswered = (id) => Object.prototype.hasOwnProperty.call(answers, id);

  const navigateTo = (newIdx) => {
    const currentId = questions[currentQuestion].id;
    if (!hasAnswered(currentId) && !visited.includes(currentId)) {
      setVisited(prev => [...prev, currentId]);
    }
    setCurrentQuestion(newIdx);
  };

  // Summary counts for finish modal
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const answeredAndMarked = questions.filter(q => hasAnswered(q.id) && markedForReview.includes(q.id)).length;
  const answeredOnly = answeredCount - answeredAndMarked;
  const notAnsweredCount = total - answeredCount;

  // categorized lists for modal
  const answeredOnlyList = questions.filter(q => hasAnswered(q.id) && !markedForReview.includes(q.id)).map(q => q.id);
  const markedOnlyList = questions.filter(q => !hasAnswered(q.id) && markedForReview.includes(q.id)).map(q => q.id);
  const answeredAndMarkedList = questions.filter(q => hasAnswered(q.id) && markedForReview.includes(q.id)).map(q => q.id);
  const notAnsweredList = questions.filter(q => !hasAnswered(q.id) && !visited.includes(q.id) && !markedForReview.includes(q.id)).map(q => q.id);
  const visitedNotAnsweredList = questions.filter(q => visited.includes(q.id) && !hasAnswered(q.id)).map(q => q.id);

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
            <p className="flex items-start"><CheckCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" /> Full-screen mode is mandatory. Leaving full-screen will flag your attempt.</p>
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
          <Button variant="destructive" onClick={() => setShowConfirmFinish(true)}>Finish Exam</Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full bg-white rounded-2xl border p-10 shadow-sm relative min-h-[400px]">
            <span className="absolute top-6 left-6 text-sm font-semibold text-slate-400">Question {currentQuestion + 1} of {questions.length}</span>

            <h3 className="text-2xl font-medium mt-10 mb-8 text-slate-800">
              {questions[currentQuestion].text}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const q = questions[currentQuestion];
                // MCQ (default)
                if (q.type === 'tf') {
                  return ['True', 'False'].map((opt, idx) => {
                    const val = opt === 'True';
                    const selected = hasAnswered(q.id) && answers[q.id] === val;
                    return (
                      <div
                        key={idx}
                        onClick={() => setAnswers({ ...answers, [q.id]: val })}
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

                if (q.type === 'short') {
                  return (
                    <div className="col-span-1 md:col-span-2">
                      <textarea
                        rows={3}
                        className="w-full border rounded-lg p-3"
                        value={hasAnswered(q.id) ? answers[q.id] : ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder="Type your answer here..."
                      />
                    </div>
                  );
                }

                if (q.type === 'fill') {
                  return (
                    <div className="col-span-1 md:col-span-2">
                      <input
                        className="w-full border rounded-lg p-3"
                        value={hasAnswered(q.id) ? answers[q.id] : ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder="Fill the blank"
                      />
                    </div>
                  );
                }

                // default MCQ
                return q.options?.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [q.id]: option })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-3
                      ${hasAnswered(q.id) && answers[q.id] === option ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${hasAnswered(q.id) && answers[q.id] === option ? 'border-primary' : 'border-slate-300'}`}>
                      {hasAnswered(q.id) && answers[q.id] === option && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
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
                  onClick={() => toggleMarkForReview(questions[currentQuestion].id)}
                  className={markedForReview.includes(questions[currentQuestion].id) ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : ''}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {markedForReview.includes(questions[currentQuestion].id) ? 'Marked' : 'Mark for Review'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={!hasAnswered(questions[currentQuestion].id)}
                  onClick={() => clearResponse(questions[currentQuestion].id)}
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
                key={q.id}
                onClick={() => navigateTo(idx)}
                className={`m-1 w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center
                  ${currentQuestion === idx ? 'ring-2 ring-black ring-offset-2 z-20' : ''}
                  ${markedForReview.includes(q.id) ? 'bg-yellow-500 text-white' :
                    hasAnswered(q.id) ? 'bg-green-500 text-white' : visited.includes(q.id) ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {idx + 1}
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
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleFinishExam}>Yes, Finish Exam</Button>
                <Button variant="ghost" onClick={() => setShowConfirmFinish(false)}>Back to Exam</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamPortal;