import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Award,
  Target,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { getExamWithAnswers } from '../../../services/examApi';

export default function ExamResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId: paramExamId } = useParams();
  const { resultData } = location.state || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [fullExam, setFullExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [effectiveResultData, setEffectiveResultData] = useState(resultData);
  const itemsPerPage = 5;

  // derive safe defaults so hooks order is constant
  const {
    score = 0,
    correctAnswers = 0,
    totalQuestions = 0,
    timeSpent = 0,
    markedForReview = 0,
    notAnswered = 0,
    weakAreas = [],
    answers: resultAnswers = {},
    allQuestions: originalQuestions = []
  } = effectiveResultData || {};

  // Ensure allAnswers always exists
  const allAnswers = effectiveResultData?.answers || resultAnswers || {};
  const allQuestions = fullExam?.questions || originalQuestions || [];

  const computeStats = (questions, answers) => {
    let correctAnswers = 0;
    let totalQuestions = questions.length;
    let notAnswered = 0;
    let markedForReview = 0; // Assuming not available from API
    let timeSpent = 0; // Assuming not available from API
    let score = 0;

    questions.forEach(q => {
      const questionId = q._id || q.id;
      const userAnswer = answers[questionId];
      if (userAnswer === undefined || userAnswer === null) {
        notAnswered++;
      } else {
        const isCorrect = typeof q.correct === 'boolean'
          ? userAnswer === q.correct
          : userAnswer?.toString().toLowerCase() === q.correct?.toString().toLowerCase();
        if (isCorrect) correctAnswers++;
      }
    });

    score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      markedForReview,
      notAnswered,
      answers,
      allQuestions: questions
    };
  };

  const percentage = score;
  const timeSpentMin = Math.floor(timeSpent / 60);
  const timeSpentSec = timeSpent % 60;

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 75) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 60) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 40) return { level: 'Below Average', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(percentage);

  const categoryPerformance = useMemo(() => {
    const categories = {};
    allQuestions.forEach(q => {
      const category = q.type || 'mcq';
      const questionId = q._id || q.id;
      const userAnswer = allAnswers[questionId];
      
      // Initialize category if not exists
      if (!categories[category]) {
        categories[category] = { total: 0, correct: 0, answered: 0 };
      }
      
      categories[category].total++;
      
      // Only count answered questions
      if (userAnswer !== undefined && userAnswer !== null) {
        categories[category].answered++;
        const isCorrect = typeof q.correct === 'boolean'
          ? userAnswer === q.correct
          : userAnswer?.toString().toLowerCase() === q.correct?.toString().toLowerCase();
        if (isCorrect) categories[category].correct++;
      }
    });
    return categories;
  }, [allQuestions, allAnswers]);

  const filteredReviewQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const questionId = q._id || q.id;
      const userAnswer = allAnswers[questionId];
      const isAnswered = userAnswer !== undefined && userAnswer !== null;
      
      if (!isAnswered) {
        // Not answered question
        if (reviewFilter === 'all' || reviewFilter === 'not-answered') return true;
        return false;
      }
      
      // Answered question - check if correct
      const isCorrect = typeof q.correct === 'boolean'
        ? userAnswer === q.correct
        : userAnswer?.toString().toLowerCase() === q.correct?.toString().toLowerCase();

      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'wrong') return !isCorrect;
      if (reviewFilter === 'not-answered') return false;
      return true; // 'all'
    });
  }, [allQuestions, allAnswers, reviewFilter]);

  const totalPages = Math.ceil(filteredReviewQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredReviewQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const examId = resultData?.examId || paramExamId;
    if (examId) {
      const fetchFullExam = async () => {
        try {
          const response = await getExamWithAnswers(examId);
          setFullExam(response.exam);
          
          // If no resultData from navigation, use the result from the fetched exam
          if (!resultData && response.exam?.result?.isCompleted) {
            const result = response.exam.result;
            // Set the effectiveResultData with all answer information
            setEffectiveResultData({
              ...result,
              answers: result.answers || {},
              allQuestions: response.exam.questions || [],
              examId
            });
          } else if (resultData && !effectiveResultData?.answers) {
            // If resultData exists but answers are not set, set them from resultData
            setEffectiveResultData({
              ...resultData,
              answers: resultData.answers || {},
              allQuestions: response.exam.questions || []
            });
          }
        } catch (error) {
          console.error("Failed to fetch exam with answers:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFullExam();
    } else {
      setLoading(false);
    }
  }, [paramExamId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!effectiveResultData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <Button onClick={() => navigate('/dashboard/exams')}>Back to Exams</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Exam Results</h1>
          <p className="text-slate-600">Here's your comprehensive performance analysis</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${performance.bg} border-2 rounded-2xl p-8 mb-8 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Score</h2>
              <p className={`text-lg font-semibold ${performance.color}`}>{performance.level} Performance</p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-slate-900">{percentage}</div>
              <div className="text-slate-600 font-medium">out of 100</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-300">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-2xl text-slate-900">{correctAnswers}</div>
              <div className="text-sm text-slate-600">Correct</div>
            </div>
            <div className="text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-bold text-2xl text-slate-900">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-slate-600">Incorrect</div>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-2xl text-slate-900">{timeSpentMin}m {timeSpentSec}s</div>
              <div className="text-sm text-slate-600">Time Spent</div>
            </div>
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-bold text-2xl text-slate-900">{notAnswered}</div>
              <div className="text-sm text-slate-600">Not Answered</div>
            </div>
          </div>
        </motion.div>

        <div className="flex w-full gap-2 mb-8 bg-white rounded-xl shadow-sm p-2">
          {['overview', 'analysis', 'review'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition-all text-center ${activeTab === tab
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /> Performance Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-slate-700 font-medium">Total Questions</span><span className="text-2xl font-bold text-slate-900">{totalQuestions}</span></div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg"><span className="text-slate-700 font-medium">Correct Answers</span><span className="text-2xl font-bold text-green-600">{correctAnswers}</span></div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg"><span className="text-slate-700 font-medium">Wrong Answers</span><span className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</span></div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg"><span className="text-slate-700 font-medium">Success Rate</span><span className="text-2xl font-bold text-blue-600">{percentage}%</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Clock className="h-6 w-6 text-primary" /> Time Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-slate-700 font-medium">Time Spent</span><span className="text-2xl font-bold text-slate-900">{timeSpentMin}m {timeSpentSec}s</span></div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-slate-700 font-medium">Avg. Per Question</span><span className="text-2xl font-bold text-slate-900">{totalQuestions > 0 ? Math.floor(timeSpent / totalQuestions) : 0}s</span></div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"><span className="text-slate-700 font-medium">Marked for Review</span><span className="text-2xl font-bold text-orange-600">{markedForReview}</span></div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg"><span className="text-slate-700 font-medium">Not Answered</span><span className="text-2xl font-bold text-red-600">{notAnswered}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" /> Category-wise Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(categoryPerformance).length > 0 ? (
                    Object.entries(categoryPerformance).map(([category, stats]) => {
                      // Only show if there are answered questions
                      if (stats.answered === 0) return null;
                      
                      const catPercentage = Math.round((stats.correct / stats.answered) * 100);
                      const label = category === 'mcq' ? 'Multiple Choice' 
                        : category === 'shortAns' ? 'Short Answer' 
                        : category === 'fillBlanks' ? 'Fill Blanks' 
                        : category === 'trueFalse' ? 'True/False' 
                        : category;

                      return (
                        <motion.div
                          key={category}
                          variants={itemVariants}
                          className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
                        >
                          <h4 className="text-lg font-bold text-slate-900 mb-4 capitalize">{label}</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-slate-600">Correct</span>
                              <span className="font-bold text-slate-900">{stats.correct}/{stats.answered}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${catPercentage}%` }}
                              />
                            </div>
                            <div className="text-center pt-2">
                              <span className="text-3xl font-bold text-slate-900">{catPercentage}%</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center text-slate-500">No questions answered yet.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h3 className="text-xl font-bold text-slate-900">Comprehensive Review</h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg flex-wrap">
                    {['all', 'correct', 'wrong', 'not-answered'].map((f) => (
                      <button
                        key={f}
                        onClick={() => { setReviewFilter(f); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${reviewFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {f === 'not-answered' ? 'Not Answered' : f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {paginatedQuestions.length > 0 ? (
                    paginatedQuestions.map((q, idx) => {
                      const questionId = q._id || q.id;
                      const userAnswer = allAnswers[questionId];
                      const isAnswered = userAnswer !== undefined && userAnswer !== null;
                      let isCorrect = false;
                      
                      if (isAnswered) {
                        isCorrect = typeof q.correct === 'boolean'
                          ? userAnswer === q.correct
                          : userAnswer?.toString().toLowerCase() === q.correct?.toString().toLowerCase();
                      }
                      
                      const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                      
                      let bgColor = 'bg-gray-50/50 border-gray-200';
                      let icon = null;
                      let statusText = 'Not Answered';
                      
                      if (isAnswered) {
                        if (isCorrect) {
                          bgColor = 'bg-green-50/50 border-green-200';
                          icon = <CheckCircle className="h-5 w-5 text-green-600 mt-1" />;
                          statusText = 'Correct';
                        } else {
                          bgColor = 'bg-red-50/50 border-red-200';
                          icon = <XCircle className="h-5 w-5 text-red-600 mt-1" />;
                          statusText = 'Incorrect';
                        }
                      } else {
                        icon = <AlertCircle className="h-5 w-5 text-gray-500 mt-1" />;
                      }

                      return (
                        <div key={q._id || idx} className={`p-5 border-2 rounded-xl transition-all ${bgColor}`}>
                          <div className="flex items-start gap-3">
                            {icon}
                            <div className="flex-grow">
                              <p className="font-bold text-slate-900 mb-3 text-sm">{globalIdx}. {q.text}</p>
                              <div className="flex flex-col gap-2 text-xs">
                                <div className="text-slate-600">
                                  <span className="font-semibold text-slate-900">Your Answer:</span> {' '}
                                  <span className={isAnswered ? (isCorrect ? 'text-green-700' : 'text-red-700') : 'text-gray-500'}>
                                    {isAnswered ? userAnswer : 'Not Answered'}
                                  </span>
                                </div>
                                {isAnswered && !isCorrect && (
                                  <div className="text-slate-600">
                                    <span className="font-semibold text-green-700">Correct Answer:</span> {' '}
                                    <span className="text-green-700">{q.correct !== undefined ? q.correct : 'Not specified'}</span>
                                  </div>
                                )}
                                <div className="text-slate-600 pt-1">
                                  <span className={`font-semibold px-2 py-1 rounded text-xs ${
                                    isAnswered ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {statusText}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500">No questions found matching this filter.</div>
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
                    <span className="text-sm font-medium text-slate-600">Page {currentPage} of {totalPages}</span>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-12">
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard/exams')}>Back to Exams</Button>
          <Button size="lg" onClick={() => navigate('/dashboard/exams')} className="gap-2">Take Another Exam <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}