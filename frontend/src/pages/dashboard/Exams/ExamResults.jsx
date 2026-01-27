import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

export default function ExamResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resultData } = location.state || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (!resultData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <Button onClick={() => navigate('/dashboard/exams')}>Back to Exams</Button>
        </div>
      </div>
    );
  }

  const {
    score,
    correctAnswers,
    totalQuestions,
    timeSpent,
    markedForReview,
    notAnswered,
    weakAreas,
    allAnswers,
    allQuestions
  } = resultData;

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
      if (!categories[category]) {
        categories[category] = { total: 0, correct: 0 };
      }
      categories[category].total++;

      const userAnswer = allAnswers[q.id];
      if (userAnswer !== undefined) {
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
      const isAnswered = allAnswers[q.id] !== undefined;
      const isCorrect = isAnswered && (
        typeof q.correct === 'boolean'
          ? allAnswers[q.id] === q.correct
          : allAnswers[q.id]?.toString().toLowerCase() === q.correct?.toString().toLowerCase()
      );

      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'wrong') return !isCorrect;
      return true;
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
          {['overview', 'analysis', 'weak-areas', 'review'].map((tab) => (
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
                  {Object.entries(categoryPerformance).map(([category, stats]) => {
                    const catPercentage = Math.round((stats.correct / stats.total) * 100);
                    const label = category === 'mcq' ? 'Multiple Choice' : category === 'short' ? 'Short Answer' : category === 'fill' ? 'Fill Blanks' : 'True/False';

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
                            <span className="font-bold text-slate-900">{stats.correct}/{stats.total}</span>
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
                  })}
                </div>
              </div>
            )}

            {activeTab === 'weak-areas' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Target className="h-6 w-6 text-red-600" /> Improvement Roadmap
                </h3>
                {weakAreas.length > 0 ? (
                  <div className="space-y-6">
                    {weakAreas.map((question, idx) => (
                      <div key={question.id} className="p-6 border-2 border-red-100 bg-red-50/30 rounded-xl">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700">{idx + 1}</div>
                          <div className="flex-grow">
                            <h4 className="font-bold text-slate-900 mb-3">{question.text}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-white p-3 rounded-lg border-l-4 border-red-500">
                                <span className="text-xs text-slate-500 block mb-1">Your Answer</span>
                                <span className="font-medium text-slate-900">{allAnswers[question.id] || 'Not answered'}</span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                                <span className="text-xs text-slate-500 block mb-1">Correct Answer</span>
                                <span className="font-medium text-slate-900">{question.correct}</span>
                              </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2">
                                <Lightbulb className="h-4 w-4" /> AI Explanation
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {question.explanation || "This question tests your understanding of core concepts in this domain. Focus on the relationship between variables and the specific terminology used in the correct choice."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                      <h4 className="font-bold text-primary mb-3 flex items-center gap-2"><Award className="h-5 w-5" /> Recommended Study Plan</h4>
                      <ul className="space-y-2 text-slate-700 text-sm">
                        <li>• Review the fundamentals of {Object.keys(categoryPerformance)[0] || 'the core'} topics where accuracy was below 60%.</li>
                        <li>• Practice 5-10 additional questions focusing specifically on your "Wrong" answer list.</li>
                        <li>• Schedule a mock interview session focusing on technical explanations of these weak areas.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600">Perfect Score!</h3>
                    <p className="text-slate-600 mt-2">You mastered every topic in this assessment.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'review' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h3 className="text-xl font-bold text-slate-900">Comprehensive Review</h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['all', 'correct', 'wrong'].map((f) => (
                      <button
                        key={f}
                        onClick={() => { setReviewFilter(f); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${reviewFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {paginatedQuestions.length > 0 ? (
                    paginatedQuestions.map((q, idx) => {
                      const isAns = allAnswers[q.id] !== undefined;
                      const isCorr = isAns && (
                        typeof q.correct === 'boolean'
                          ? allAnswers[q.id] === q.correct
                          : allAnswers[q.id]?.toString().toLowerCase() === q.correct?.toString().toLowerCase()
                      );
                      const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;

                      return (
                        <div key={q.id} className={`p-5 border-2 rounded-xl transition-all ${isCorr ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                          <div className="flex items-start gap-3">
                            {isCorr ? <CheckCircle className="h-5 w-5 text-green-600 mt-1" /> : <XCircle className="h-5 w-5 text-red-600 mt-1" />}
                            <div className="flex-grow">
                              <p className="font-bold text-slate-900 mb-3 text-sm">{globalIdx}. {q.text}</p>
                              <div className="flex flex-wrap gap-4 text-xs">
                                <div className="text-slate-600"><span className="font-semibold text-slate-900">Your Answer:</span> {allAnswers[q.id] || 'No Answer'}</div>
                                {!isCorr && <div className="text-slate-600"><span className="font-semibold text-green-700">Correct:</span> {q.correct}</div>}
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