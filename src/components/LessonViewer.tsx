import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, toggleLessonCompletion } from "../store";
import { 
  Play, 
  BookOpen, 
  Code, 
  CheckCircle, 
  Circle, 
  HelpCircle,
  Award,
  ChevronRight,
  ArrowLeft,
  Tv
} from "lucide-react";

interface LessonViewerProps {
  courseId: string;
  onBack: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedQuizId: (id: string | null) => void;
}

export function LessonViewer({ courseId, onBack, setActiveTab, setSelectedQuizId }: LessonViewerProps) {
  const dispatch = useDispatch();
  const { courses, lessons, progressList, enrollments } = useSelector((state: RootState) => state.courses);

  const course = courses.find(c => c.id === courseId);
  const courseLessons = lessons[courseId] || [];

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (courseLessons.length > 0 && !activeLessonId) {
      setActiveLessonId(courseLessons[0].id);
    }
  }, [courseLessons, activeLessonId]);

  if (!course) {
    return (
      <div className="p-12 text-center text-gray-500">
        Course selection not loaded.
        <button onClick={onBack} className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-xs">Back</button>
      </div>
    );
  }

  const activeLesson = courseLessons.find(l => l.id === activeLessonId);

  const isCompleted = (lesId: string) => {
    return progressList.some(p => p.lessonId === lesId && p.completed);
  };

  const handleToggleCompletion = async () => {
    if (!activeLessonId) return;
    await (dispatch as any)(toggleLessonCompletion({ lessonId: activeLessonId, courseId }));
  };

  const handleNext = () => {
    if (!activeLesson) return;
    const idx = courseLessons.findIndex(l => l.id === activeLesson.id);
    if (idx !== -1 && idx < courseLessons.length - 1) {
      setActiveLessonId(courseLessons[idx + 1].id);
    }
  };

  // Trigger taking the quiz
  const handleTakeQuiz = () => {
    let quizId = "q_ts"; // TS fallbacks
    if (courseId === "crs_ai_concepts") quizId = "q_ai";
    if (courseId === "crs_basics") quizId = "q_basics";

    setSelectedQuizId(quizId);
    setActiveTab("quiz_page");
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      
      {/* 1. Main player area (Left side) */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto border-r border-slate-100 bg-white">
        
        {/* Top title bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className="p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-400 cursor-pointer"
              title="Return to Catalog"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">{course.title}</span>
              <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{activeLesson?.title || "Loading..."}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="lesson_toggle_complete_btn"
              onClick={handleToggleCompletion}
              className={`flex items-center gap-1.5 text-xs font-bold rounded-xl px-4 py-2 transition-all cursor-pointer ${
                activeLessonId && isCompleted(activeLessonId)
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-emerald-500 text-slate-955 hover:bg-emerald-400 shadow-sm"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{activeLessonId && isCompleted(activeLessonId) ? "Lesson Completed" : "Mark Complete"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic media player view workspace */}
        <div className="p-6 flex-1 max-w-4xl mx-auto w-full space-y-6">
          {activeLesson ? (
            <div className="space-y-6">
              {/* Content Player card depending on content type */}
              {activeLesson.contentType === "video" ? (
                <div className="rounded-3xl overflow-hidden shadow-md bg-linear-to-b from-slate-900 to-black relative aspect-video border border-slate-800">
                  {activeLesson.contentUrl ? (
                    <video 
                      src={activeLesson.contentUrl} 
                      controls 
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&q=80&w=1200"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <Tv className="h-12 w-12 text-slate-500 animate-pulse" />
                      <span className="text-sm font-bold font-mono mt-2">Active Streaming Port Opened</span>
                    </div>
                  )}
                </div>
              ) : activeLesson.contentType === "html" ? (
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/10 p-5 font-mono text-[11px] leading-relaxed relative">
                  <div className="absolute top-4 right-4 text-emerald-600 flex items-center gap-1 font-bold tracking-wider text-[9px] uppercase">
                    <Code className="h-3 w-3 animate-pulse" /> Code View
                  </div>
                  {/* Safely output sanitized seeded html content with styling */}
                  <div 
                    className="prose prose-sm text-slate-700 max-w-none"
                    dangerouslySetInnerHTML={{ __html: activeLesson.content || "" }} 
                  />
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50/55 p-6 border border-slate-100">
                  {/* Clean Text-based lessons markdown blocks */}
                  <div className="prose prose-emerald max-w-none leading-relaxed text-slate-700 whitespace-pre-wrap text-sm font-medium">
                    {activeLesson.content}
                  </div>
                </div>
              )}

              {/* Action navigations */}
              <div className="flex justify-between items-center border-t border-slate-105 pt-6">
                <span className="text-xs text-slate-400 font-mono font-medium">Length: {activeLesson.durationMinutes} minutes duration</span>
                
                <div className="flex gap-2">
                  <button
                    id="lesson_next_btn"
                    onClick={handleNext}
                    className="rounded-xl border border-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Next Lesson <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  
                  <button
                    id="lesson_quiz_shortcut_btn"
                    onClick={handleTakeQuiz}
                    className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="h-4 w-4 text-emerald-405 animate-pulse" /> Take Course Evaluation
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-450">
              <BookOpen className="mx-auto h-8 w-8 text-emerald-500 animate-spin" />
              <p className="mt-2 text-xs font-medium">Awaiting Matrix lessons sync...</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Lessons timeline indices tracker (Right side panel) */}
      <div className="w-full lg:w-80 h-1/2 lg:h-full bg-white flex flex-col overflow-hidden select-none shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40">
          <span className="text-xs font-bold text-slate-800 block">Lessons Index Portfolio</span>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Progress locks automatically upon completes</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {courseLessons.map((les, index) => {
            const active = les.id === activeLessonId;
            const completed = isCompleted(les.id);
            return (
              <button
                key={les.id}
                id={`lesson_item_btn_${les.id}`}
                onClick={() => setActiveLessonId(les.id)}
                className={`w-full text-left p-4 transition-all flex gap-3 text-xs cursor-pointer ${
                  active ? "bg-emerald-500/5 border-l-4 border-emerald-500" : "hover:bg-slate-50"
                }`}
              >
                <div className="mt-0.5 text-emerald-600 shrink-0 animate-fade-in">
                  {completed ? (
                    <CheckCircle className="h-4.5 w-4.5 fill-emerald-50 text-emerald-500" />
                  ) : active ? (
                    <Play className="h-4.5 w-4.5 text-emerald-500 fill-emerald-500 animate-pulse" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 text-slate-300" />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] font-mono tracking-wider font-bold text-slate-400 uppercase">Lesson #{index + 1}</span>
                  <span className={`block font-bold leading-normal ${active ? "text-slate-900" : "text-slate-600"}`}>{les.title}</span>
                  <span className="block text-[10px] text-slate-400 capitalize font-medium">{les.contentType} player • {les.durationMinutes}m</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Foot lock review card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            id="timeline_quiz_init_btn"
            onClick={handleTakeQuiz}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <HelpCircle className="h-4 w-4" /> Start Evaluation Quiz
          </button>
        </div>

      </div>
    </div>
  );
}
