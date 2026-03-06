import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import DashboardLayout from "../../../components/interactive/DashboardLayout";
import { 
  Search, 
  ArrowLeft,
  BookOpen,
  Calendar,
  Zap,
  RotateCcw,
  Eye
} from "lucide-react";
import { getUserExams, retakeExam } from "../../../services/examApi";
import { Button } from "../../../components/ui/button";

export default function AllExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [retriesLoading, setRetriesLoading] = useState({});

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const response = await getUserExams();
        setExams(response.exams || []);
      } catch (error) {
        console.error("Failed to load exams:", error);
        // do not clear existing exams on error
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user) {
      loadExams();
    }
  }, [authLoading, user]);
  
  const filteredExams = exams.filter(exam => {
    const searchLower = searchTerm.toLowerCase();
    return (
      exam.title?.toLowerCase().includes(searchLower) ||
      exam.materialTitle?.toLowerCase().includes(searchLower)
    );
  });

  const sortedExams = [...filteredExams].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    if (status === "ready") {
      return { bg: "bg-green-50", text: "text-green-700", label: "Ready" };
    } else if (status === "generating") {
      return { bg: "bg-yellow-50", text: "text-yellow-700", label: "Generating" };
    } else if (status === "failed") {
      return { bg: "bg-red-50", text: "text-red-700", label: "Failed" };
    }
    return { bg: "bg-gray-50", text: "text-gray-700", label: "Unknown" };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "easy": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "hard": return "text-red-600";
      case "mixed": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const handleRetakeExam = async (examId) => {
    try {
      setRetriesLoading(prev => ({ ...prev, [examId]: true }));
      const response = await retakeExam(examId);
      // Refresh exams list
      const updatedResponse = await getUserExams();
      setExams(updatedResponse.exams || []);
      // Navigate to the newly created exam
      navigate(`/dashboard/exams/start`, { state: { examId: response.examId } });
    } catch (error) {
      console.error("Failed to create retake exam:", error);
      alert("Failed to create retake exam. Please try again.");
    } finally {
      setRetriesLoading(prev => ({ ...prev, [examId]: false }));
    }
  };

  const handleViewResults = (exam) => {
    if (exam.result?.isCompleted) {
      navigate(`/dashboard/exams/results/${exam._id}`, {
        state: {
          resultData: {
            score: exam.result.score,
            correctAnswers: exam.result.correctAnswers,
            totalQuestions: exam.result.totalQuestions,
            timeSpent: exam.result.timeSpent,
            markedForReview: exam.result.markedForReview,
            notAnswered: exam.result.notAnswered,
            allAnswers: exam.result.answers,
            weakAreas: [],
            examId: exam._id
          }
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/exams")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exam Hall
          </button>
          <h1 className="text-3xl font-bold mb-2">All Exams</h1>
          <p className="text-muted-foreground">Browse all your generated exams and their status</p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exams by title or material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Exams List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading exams...</p>
          </div>
        ) : sortedExams.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? "No exams match your search" : "No exams yet. Create your first exam!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedExams.map((exam) => {
              const statusBadge = getStatusBadge(exam.status);
              const isCompleted = exam.result?.isCompleted;
              const clickable = exam.status === "ready" || isCompleted;

              const handleCardClick = () => {
                if (isCompleted) {
                  handleViewResults(exam);
                } else if (exam.status === "ready") {
                  navigate(`/dashboard/exams/start`, { state: { examId: exam._id } });
                }
              };

              return (
                <div
                  key={exam._id}
                  onClick={clickable ? handleCardClick : undefined}
                  className={`bg-card border border-border rounded-lg p-6 transition-all relative
                    ${isCompleted ? 'border-green-200 bg-green-50' : ''}
                    ${exam.status === "ready" && !isCompleted ? "hover:shadow-md hover:border-primary cursor-pointer" : ""}
                  `}
                >
                  <div className="flex items-start justify-between z-10">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {exam.title || exam.materialTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(exam.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {exam.totalQuestions} questions
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className={`h-4 w-4 ${getDifficultyColor(exam.config?.difficulty)}`} />
                          <span className={getDifficultyColor(exam.config?.difficulty)}>
                            {exam.config?.difficulty || "Unknown"}
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-1 ml-4 font-semibold text-green-700">
                            Score: {exam.result.score}%
                          </div>
                        )}
                      </div>

                      {/* question type badges */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {exam.config?.questionTypes?.mcq && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">MCQ</span>
                        )}
                        {exam.config?.questionTypes?.trueFalse && (
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">T/F</span>
                        )}
                        {exam.config?.questionTypes?.fillBlanks && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Fill in</span>
                        )}
                        {exam.config?.questionTypes?.shortAns && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Short</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {isCompleted ? 'Completed' : statusBadge.label}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="mt-2 flex flex-col gap-2">
                        {isCompleted ? (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleViewResults(exam); }}
                              className="text-xs text-primary hover:underline font-medium flex items-center justify-end gap-1 w-full"
                            >
                              <Eye className="h-3 w-3" />
                              View Results
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRetakeExam(exam._id); }}
                              disabled={retriesLoading[exam._id]}
                              className="text-xs text-blue-600 hover:underline font-medium flex items-center justify-end gap-1 w-full disabled:opacity-50"
                            >
                              <RotateCcw className="h-3 w-3" />
                              {retriesLoading[exam._id] ? 'Creating...' : 'Retake'}
                            </button>
                          </>
                        ) : exam.status === "ready" ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/exams/start`, { state: { examId: exam._id } }); }}
                            className="mt-2 text-xs text-primary hover:underline font-medium"
                          >
                            Take Exam →
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  {/* Question Types */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {exam.config?.questionTypes?.mcq && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">MCQ</span>
                      )}
                      {exam.config?.questionTypes?.trueFalse && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">True/False</span>
                      )}
                      {exam.config?.questionTypes?.fillBlanks && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Fill Blanks</span>
                      )}
                      {exam.config?.questionTypes?.shortAns && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Short Ans</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && exams.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Exams</p>
              <p className="text-2xl font-bold">{exams.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Ready to Take</p>
              <p className="text-2xl font-bold text-green-600">{exams.filter(e => e.status === "ready" && !e.result?.isCompleted).length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{exams.filter(e => e.result?.isCompleted).length}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
