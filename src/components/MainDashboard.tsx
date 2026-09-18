import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Course } from "../types";
import { 
  Flame, 
  Clock, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  BookOpen
} from "lucide-react";

interface MainDashboardProps {
  setActiveTab: (tab: string) => void;
  setSelectedCourseId: (id: string | null) => void;
}

export function MainDashboard({ setActiveTab, setSelectedCourseId }: MainDashboardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { courses, enrollments, progressList } = useSelector((state: RootState) => state.courses);
  const { attempts, recommendations, certificates } = useSelector((state: RootState) => state.quiz);

  // Math helper stats
  const activeEnr = enrollments.length;
  const completedEnrList = enrollments.filter(e => e.finished);
  
  // Hours calculated virtually
  const completedLessonsCount = progressList.filter(p => p.completed).length;
  const rawHours = (completedLessonsCount * 15 + activeEnr * 30) / 60;
  const studyHours = Math.round(rawHours * 10) / 10;

  const averageQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, att) => sum + att.score, 0) / attempts.length)
    : 0;

  // Find recent active course to let user resume
  const activeEnrolledCourses = enrollments.map(e => {
    const original = courses.find(c => c.id === e.courseId);
    return original ? { ...original, enrollment: e } : null;
  }).filter(Boolean) as Array<Course & { enrollment: any }>;

  const handleResumeCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab("lessons_viewer");
  };

  const handleStartCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab("lessons_viewer");
  };

  // Get most recent study advice
  const latestRecommendation = recommendations[0];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Banner greeting card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 text-white relative shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
        
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-emerald-300 uppercase border border-emerald-500/30">
            <Sparkles className="h-3 w-3 text-emerald-300 animate-pulse" /> Core Matrix Online
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl tracking-tight">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-300 leading-relaxed">
            Ready to enhance your tech foundations? Master types, neural networks, and layouts down your customized learning paths.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              id="dash_explore_btn"
              onClick={() => setActiveTab("courses")}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all shadow-md shadow-emerald-500/10 active:scale-98 cursor-pointer"
            >
              Explore Course Catalog
            </button>
            <button
              id="dash_cert_btn"
              onClick={() => setActiveTab("certificates")}
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 cursor-pointer"
            >
              View Issued Certificates
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Counter Bento Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-emerald-500">
            <Flame className="h-6 w-6 fill-current animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 font-mono tracking-wide uppercase">Login Streak</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{user?.streak || 1} Days</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
          <div className="rounded-2xl bg-slate-900/5 border border-slate-900/10 p-3.5 text-slate-700">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 font-mono tracking-wide uppercase">Study Hours</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{studyHours} hrs</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-emerald-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 font-mono tracking-wide uppercase">Completed</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{completedEnrList.length} Courses</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5">
          <div className="rounded-2xl bg-slate-900/5 border border-slate-900/10 p-3.5 text-slate-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 font-mono tracking-wide uppercase">Avg Quiz Score</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{averageQuizScore}%</span>
          </div>
        </div>
      </div>

      {/* Recommendation Engine Matrix section */}
      {latestRecommendation && (
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-emerald-500/5 p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-600 uppercase font-mono">
                <Sparkles className="h-3 w-3" /> Matrix Recommended Path
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                Study Advisory: {
                  latestRecommendation.recommendationType === "PROCEED" 
                    ? "Advanced Proceed Path" 
                    : latestRecommendation.recommendationType === "REVISE"
                    ? "Critical Course Revision"
                    : "Foundational Reboot Needed"
                }
              </h3>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed whitespace-pre-wrap">
                {latestRecommendation.feedbackText}
              </p>
            </div>
            
            {latestRecommendation.suggestedCourseId && (
              <button
                id="dash_rec_suggest_btn"
                onClick={() => handleStartCourse(latestRecommendation.suggestedCourseId!)}
                className="mt-3 md:mt-0 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 shadow-sm whitespace-nowrap cursor-pointer"
              >
                Launch Recommended Module
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enrolled Active Studies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Enrolled Learning Modules</h3>
          <span className="text-xs text-slate-500 font-mono font-semibold">{activeEnrolledCourses.length} active enrollments</span>
        </div>

        {activeEnrolledCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/40">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <h4 className="mt-2 text-sm font-bold text-slate-600">No active enrollments yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Explore our curriculum catalog of high performance typescript, AI models, and markup basics to start coding.</p>
            <button
              id="dash_first_course_btn"
              onClick={() => setActiveTab("courses")}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEnrolledCourses.map((course) => (
              <div 
                key={course.id} 
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-mono font-bold text-slate-500">
                      {course.category} • {course.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {course.enrollment.progressPercentage}% complete
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-extrabold text-slate-900 group-hover:text-emerald-500 transition-colors line-clamp-1">{course.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{course.description}</p>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Progress Line */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${course.enrollment.progressPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">Completed: {progressList.filter(p => p.courseId === course.id && p.completed).length} lessons</span>
                    <button
                      id={`dash_resume_btn_${course.id}`}
                      onClick={() => handleResumeCourse(course.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      Resume Learning <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
