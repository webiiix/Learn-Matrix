import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, submitQuiz } from "../store";
import { 
  Clock, 
  HelpCircle, 
  SquareDot, 
  CheckCircle2, 
  XSquare, 
  Sparkles, 
  Award, 
  ArrowRight, 
  BookOpen,
  ArrowLeft
} from "lucide-react";

interface QuizEngineProps {
  quizId: string;
  onBack: () => void;
  setActiveTab: (tab: string) => void;
}

export function QuizEngine({ quizId, onBack, setActiveTab }: QuizEngineProps) {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const [quizMeta, setQuizMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for quiz progression
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string[] }>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  // Fetch quiz contents on mount
  useEffect(() => {
    let active = true;
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load quiz");
        
        if (active) {
          setQuizMeta(data.quiz);
          setQuestions(data.questions);
          setTimeLeft(data.quiz.timeLimitMinutes * 60);
        }
      } catch (err: any) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchQuizData();
    return () => { active = false; };
  }, [quizId, token]);

  // Timer countdown
  useEffect(() => {
    if (quizSubmitted || timeLeft <= 0 || loading || error) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizSubmitted, loading, error]);

  const handleAutoSubmit = () => {
    triggerSubmit();
  };

  const handleAnswerSelect = (qId: string, optionIndexStr: string, isMultiple: boolean) => {
    setSelectedAnswers(prev => {
      const current = prev[qId] || [];
      if (isMultiple) {
        if (current.includes(optionIndexStr)) {
          return { ...prev, [qId]: current.filter(x => x !== optionIndexStr) };
        } else {
          return { ...prev, [qId]: [...current, optionIndexStr] };
        }
      } else {
        return { ...prev, [qId]: [optionIndexStr] };
      }
    });
  };

  const triggerSubmit = async () => {
    try {
      setLoading(true);
      const res = await (dispatch as any)(submitQuiz({ quizId, answers: selectedAnswers }));
      if (submitQuiz.fulfilled.match(res)) {
        setSubmitResult(res.payload);
        setQuizSubmitted(true);
      } else {
        setError("Could not register responses. Network timeout.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading && !quizSubmitted) {
    return (
      <div className="p-24 text-center max-w-xl mx-auto space-y-4">
        <Clock className="mx-auto h-12 w-12 text-teal-500 animate-spin" />
        <h3 className="text-sm font-bold text-gray-700">Calibrating matrix evaluation grid...</h3>
      </div>
    );
  }

  if (error && !quizSubmitted) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <XSquare className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="text-base font-black text-gray-800">Connection Interrupted</h3>
        <p className="text-xs text-gray-500">{error}</p>
        <button onClick={onBack} className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700">Back</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Quiz viewport header indicator */}
      {!quizSubmitted && quizMeta && (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-600 block">Matrix Evaluation</span>
              <h3 className="text-sm font-black text-slate-800 line-clamp-1">{quizMeta.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2 font-mono text-red-700 font-bold">
            <Clock className="h-4.5 w-4.5 text-red-600 animate-pulse" />
            <span className="text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>
      )}

      {/* Main active Q-Card workspace */}
      {!quizSubmitted && currentQuestion && (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 border-b border-slate-50 pb-4">
            <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
            <span className="capitalize">{currentQuestion.questionType} selection modifier</span>
          </div>

          <h4 className="text-lg font-extrabold text-slate-805 leading-snug">
            {currentQuestion.text}
          </h4>

          {/* Answer Choice selections */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option: string, opIdx: number) => {
              const opStr = opIdx.toString();
              const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(opStr);
              const isMultiple = currentQuestion.questionType === "multiple";

              return (
                <button
                  key={opIdx}
                  onClick={() => handleAnswerSelect(currentQuestion.id, opStr, isMultiple)}
                  className={`w-full text-left rounded-2xl border p-4 text-xs font-bold leading-relaxed transition-all flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? "border-emerald-551 bg-emerald-50/40 text-emerald-950 shadow-xs" 
                      : "border-slate-100 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span>{option}</span>
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation keys footer */}
          <div className="flex justify-between items-center border-t border-slate-50 pt-6">
            <button
              id="quiz_prev_btn"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="rounded-xl border border-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                id="quiz_next_btn"
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Next Question
              </button>
            ) : (
              <button
                id="quiz_final_submit_btn"
                onClick={triggerSubmit}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-md"
              >
                Submit Matrix Evaluation
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY PANEL WITH ADVISORY RULE RECOMMENDATIONS */}
      {quizSubmitted && submitResult && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Banner pass fail banner cards */}
          <div className={`rounded-3xl p-8 text-white relative shadow-md overflow-hidden ${
            submitResult.attempt.passed 
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-955" 
              : "bg-gradient-to-br from-slate-900 via-zinc-950 to-slate-900"
          }`}>
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 blur-xl" />
            
            <div className="relative flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-bold uppercase">
                  <Award className="h-3.5 w-3.5 text-emerald-400" /> 
                  {submitResult.attempt.passed ? "EVALUATION CERTIFIED" : "EVALUATION COMPLETED"}
                </span>
                <h3 className="text-3xl font-black tracking-tight">{quizMeta?.title} Results</h3>
                <p className="text-sm text-slate-305">
                  {submitResult.attempt.passed 
                    ? "Congratulations! You have satisfied the proficiency criteria threshold for this course node."
                    : "Progress logged. Let's analyze your results list and rebuild foundations."}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-8 py-5 text-center min-w-[12rem]">
                <span className="block text-[10px] font-mono tracking-widest text-emerald-300 uppercase font-black">Final Score</span>
                <span className="text-5xl font-black block mt-1">{submitResult.attempt.score}%</span>
                <span className="text-xs text-slate-300 mt-1 block">Passing Criteria: 70%</span>
              </div>
            </div>
          </div>

          {/* CORE ALGORITHMIC RECOMMENDATION CARD DISPATCHED BY BACKEND (Proceed/Revise/Basics) */}
          {submitResult.recommendation && (
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-mono tracking-wider font-bold text-emerald-800 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" /> RECOMMENDATION ENGINE SUGGESTION
              </span>
              
              <h4 className="text-xl font-bold text-slate-900 capitalize">
                Matrix Action: {submitResult.recommendation.recommendationType.replace(/_/g, " ")}
              </h4>
              
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {submitResult.recommendation.feedbackText}
              </p>

              <div className="flex gap-2 pt-4">
                {submitResult.recommendation.suggestedCourseId ? (
                  <button
                    id="result_rec_action_btn"
                    onClick={() => {
                      setActiveTab("courses");
                    }}
                    className="rounded-xl bg-emerald-500 text-slate-950 px-5 py-2.5 text-xs font-bold hover:bg-emerald-400 shadow-sm cursor-pointer"
                  >
                    Enroll in Recommended course
                  </button>
                ) : (
                  <button
                    id="result_rec_course_btn"
                    onClick={() => setActiveTab("courses")}
                    className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    View Catalog Course List
                  </button>
                )}

                <button
                  id="result_rec_dash_btn"
                  onClick={() => setActiveTab("dashboard")}
                  className="rounded-xl border border-slate-100 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Certificate Generation banner block */}
          {submitResult.certificate && (
            <div className="rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-200/50 px-2.5 py-0.5 rounded-full inline-block">CERTIFICATION ISSUED</span>
                <h4 className="text-lg font-extrabold text-amber-955">Dynamic Credential Registry</h4>
                <p className="text-xs text-amber-800 leading-normal max-w-xl">LearnMatrix has signed and locked your certified status index. Verify code: <strong>{submitResult.certificate.verificationCode}</strong></p>
              </div>

              <button
                id="result_cert_download_btn"
                onClick={() => setActiveTab("certificates")}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-white px-5 py-3 text-xs shadow-xs cursor-pointer"
              >
                Claim Certificate
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
