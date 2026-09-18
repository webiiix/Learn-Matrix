import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, fetchAdminDashboard, fetchCourses } from "../store";
import { 
  Activity, 
  Users, 
  BookOpen, 
  Scroll, 
  Cpu, 
  Plus, 
  Trash2, 
  Server,
  Award,
  Settings,
  HelpCircle,
  Edit,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronRight,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { Lesson, Question, Quiz, Course, User } from "../types";

export function AdminControls({ defaultTab = "admin_dashboard" }: { defaultTab?: string }) {
  const dispatch = useDispatch();
  const { token, user: loggedUser } = useSelector((state: RootState) => state.auth);
  const { auditLogs, metrics, users } = useSelector((state: RootState) => state.admin);
  const { courses } = useSelector((state: RootState) => state.courses);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync activeTab with defaultTab prop
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Sub-tabs reload system
  const reloadAllData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await (dispatch as any)(fetchAdminDashboard());
      await (dispatch as any)(fetchCourses());
    } catch (e: any) {
      setErrorMsg("Failed to synchronize dataload with system. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAllData();
  }, [dispatch]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  /* =========================================================================
     TAB 1: COURSE MANAGEMENT CRUD (Create, Read, Update, Delete)
     ========================================================================= */
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  // Course Form States
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCat, setCourseCat] = useState("Web Development");
  const [courseLvl, setCourseLvl] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [courseHours, setCourseHours] = useState("8");
  const [courseThumb, setCourseThumb] = useState("");

  const handleEditCourseClick = (c: Course) => {
    setEditingCourse(c);
    setCourseTitle(c.title);
    setCourseDesc(c.description);
    setCourseCat(c.category);
    setCourseLvl(c.level);
    setCourseHours(String(c.durationHours));
    setCourseThumb(c.thumbnailUrl || "");
  };

  const clearCourseForm = () => {
    setEditingCourse(null);
    setCourseTitle("");
    setCourseDesc("");
    setCourseCat("Web Development");
    setCourseLvl("Beginner");
    setCourseHours("8");
    setCourseThumb("");
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) {
      showError("Please specify a course Title and Description.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = !!editingCourse;
      const endpoint = isEdit ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDesc,
          category: courseCat,
          level: courseLvl,
          durationHours: Number(courseHours) || 8,
          thumbnailUrl: courseThumb || "https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&q=80&w=600"
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Execution failed");

      showSuccess(isEdit ? `Successfully synchronized course template: ${courseTitle}` : `Successfully deployed new course: ${courseTitle}`);
      clearCourseForm();
      reloadAllData(); // Trigger full store reload
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to soft-archive course "${name}"? Standard student accounts will no longer see it.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      showSuccess(`Archived course ${name}`);
      reloadAllData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================================
     TAB 2: LESSON MANAGEMENT CRUD (Create, Read, Update, Delete)
     ========================================================================= */
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // Lesson Form States
  const [lesTitle, setLesTitle] = useState("");
  const [lesContent, setLesContent] = useState("");
  const [lesType, setLesType] = useState<"text" | "video" | "html">("text");
  const [lesUrl, setLesUrl] = useState("");
  const [lesDuration, setLesDuration] = useState("15");

  const loadLessonsForCourse = async (cId: string) => {
    if (!cId) {
      setCourseLessons([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${cId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCourseLessons(data.lessons || []);
      }
    } catch (e: any) {
      showError("Failed to fetch lesson nodes: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadLessonsForCourse(selectedCourseId);
    } else {
      setCourseLessons([]);
    }
  }, [selectedCourseId]);

  const handleEditLesson = (l: Lesson) => {
    setEditingLesson(l);
    setLesTitle(l.title);
    setLesContent(l.content);
    setLesType(l.contentType);
    setLesUrl(l.contentUrl || "");
    setLesDuration(String(l.durationMinutes));
  };

  const clearLessonForm = () => {
    setEditingLesson(null);
    setLesTitle("");
    setLesContent("");
    setLesType("text");
    setLesUrl("");
    setLesDuration("15");
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      showError("Please select a target course first.");
      return;
    }
    if (!lesTitle || !lesContent) {
      showError("Title and lesson content summary are required.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = !!editingLesson;
      const endpoint = isEdit ? `/api/admin/lessons/${editingLesson.id}` : `/api/admin/courses/${selectedCourseId}/lessons`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: lesTitle,
          content: lesContent,
          contentType: lesType,
          contentUrl: lesUrl || undefined,
          durationMinutes: Number(lesDuration) || 15
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lesson operation failed");

      showSuccess(isEdit ? `Synchronized lesson node: ${lesTitle}` : `Registered new lesson node code: ${lesTitle}`);
      clearLessonForm();
      loadLessonsForCourse(selectedCourseId);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete lesson "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      showSuccess(`Deleted lesson node: ${title}`);
      loadLessonsForCourse(selectedCourseId);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================================
     TAB 3: QUIZ & QUESTIONS CRUD (Create, Read, Update, Delete)
     ========================================================================= */
  const [quizCourseId, setQuizCourseId] = useState("");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Quiz Config states
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState("70");
  const [quizTimeLimit, setQuizTimeLimit] = useState("15");

  // Question Form states
  const [questText, setQuestText] = useState("");
  const [questType, setQuestType] = useState<"single" | "multiple" | "boolean">("single");
  const [questOptions, setQuestOptions] = useState<string[]>(["", ""]);
  const [questCorrect, setQuestCorrect] = useState<string[]>([]); // indexes like "0", "1"

  const loadQuizForCourse = async (cId: string) => {
    if (!cId) {
      setActiveQuiz(null);
      setQuizQuestions([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${cId}/quiz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveQuiz(data.quiz);
        setQuizQuestions(data.questions || []);
        
        // Populate quiz config forms
        if (data.quiz) {
          setQuizTitle(data.quiz.title);
          setQuizPassingScore(String(data.quiz.passingScore));
          setQuizTimeLimit(String(data.quiz.timeLimitMinutes));
        }
      }
    } catch (e: any) {
      showError("Failed to fetch evaluation database. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizCourseId) {
      loadQuizForCourse(quizCourseId);
    } else {
      setActiveQuiz(null);
      setQuizQuestions([]);
    }
  }, [quizCourseId]);

  const handleSaveQuizConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCourseId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/${quizCourseId}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          passingScore: Number(quizPassingScore) || 70,
          timeLimitMinutes: Number(quizTimeLimit) || 15
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Configuration save failed");

      showSuccess(`Synchronized configuration parameters for quiz.`);
      loadQuizForCourse(quizCourseId);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestText(q.text);
    setQuestType(q.questionType);
    setQuestOptions([...q.options]);
    setQuestCorrect([...q.correctAnswers]);
  };

  const clearQuestionForm = () => {
    setEditingQuestion(null);
    setQuestText("");
    setQuestType("single");
    setQuestOptions(["", ""]);
    setQuestCorrect([]);
  };

  const handleAddOptionField = () => {
    setQuestOptions([...questOptions, ""]);
  };

  const handleRemoveOptionField = (idx: number) => {
    if (questOptions.length <= 2) {
      showError("Questions require at least two potential options.");
      return;
    }
    const filtered = questOptions.filter((_, i) => i !== idx);
    setQuestOptions(filtered);
    
    // Adjust correct answers selection indexes
    const adjustedCorrect = questCorrect
      .map(Number)
      .filter(val => val !== idx)
      .map(val => val > idx ? String(val - 1) : String(val));
    setQuestCorrect(adjustedCorrect);
  };

  const handleOptionTextChange = (idx: number, text: string) => {
    const updated = [...questOptions];
    updated[idx] = text;
    setQuestOptions(updated);
  };

  const handleToggleCorrectIndex = (idxStr: string) => {
    if (questType === "single" || questType === "boolean") {
      setQuestCorrect([idxStr]);
    } else {
      if (questCorrect.includes(idxStr)) {
        setQuestCorrect(questCorrect.filter(c => c !== idxStr));
      } else {
        setQuestCorrect([...questCorrect, idxStr]);
      }
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz) {
      showError("Please establish an active quiz module frame first.");
      return;
    }
    if (!questText) {
      showError("Please state the question evaluation text prompt.");
      return;
    }
    if (questCorrect.length === 0) {
      showError("Please specify at least one verified correct answer index.");
      return;
    }

    try {
      setLoading(true);
      const isEdit = !!editingQuestion;
      const endpoint = isEdit ? `/api/admin/questions/${editingQuestion.id}` : `/api/admin/quizzes/${activeQuiz.id}/questions`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: questText,
          questionType: questType,
          options: questType === "boolean" ? ["True", "False"] : questOptions.filter(o => o.trim() !== ""),
          correctAnswers: questCorrect
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Question save failed");

      showSuccess(isEdit ? "Evaluative question successfully modified" : "Added evaluative quiz query node");
      clearQuestionForm();
      loadQuizForCourse(quizCourseId);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Remove question node from selected course evaluation database? This is permanent.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete process declined");

      showSuccess("Permanently retracted evaluation question!");
      loadQuizForCourse(quizCourseId);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================================
     TAB 4: USER & SYSTEM ACCESS ROLE MODIFIERS
     ========================================================================= */
  const handleToggleUserRole = async (uId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
    if (!window.confirm(`Swap permissions for selected user? Elevating/revoking admin rights can drastically alter system behaviors.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${uId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update role failure");

      showSuccess(`Synchronized user security classification: ${nextRole}`);
      reloadAllData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentKillUser = async (uId: string, fullName: string) => {
    if (!window.confirm(`CRITICAL: Completely erase student account metadata, enrolled progress registry, score caches, and certifications for '${fullName}'? This action cannot be reverted.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${uId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Permanent kill rejected");

      showSuccess(`Erased account index dataset from network completely: ${fullName}`);
      reloadAllData();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     TAB 5: SEARCH FILTER AUDIT LOGS
     ========================================================================= */
  const [logsSearch, setLogsSearch] = useState("");
  const filteredLogs = auditLogs.filter(item => 
    item.userName.toLowerCase().includes(logsSearch.toLowerCase()) ||
    item.action.toLowerCase().includes(logsSearch.toLowerCase()) ||
    item.details.toLowerCase().includes(logsSearch.toLowerCase())
  );


  // Render quick metric snapshot on admin console
  const systemMetric = metrics[0] || {
    activeUsers24h: users.length,
    cpuLoad: 21,
    apiSuccessRate: 99.8,
    serverLatenyMs: 14,
    dbPoolActive: 4,
    redisHits: 95
  };


  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto select-text">
      
      {/* Dynamic system notice toast bar */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-emerald-500 text-slate-950 font-bold px-5 py-4 flex items-center gap-2 shadow-xl border border-emerald-400 select-none animate-bounce font-sans text-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-red-600 text-white font-bold px-5 py-4 flex items-center gap-2 shadow-xl border border-red-500 select-none animate-pulse font-sans text-xs">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header operations card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Enterprise LMS Operations Control
          </h2>
          <p className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">
            Administrative Matrix Terminal • Status: Fully Authorized
          </p>
        </div>
        
        <button
          onClick={reloadAllData}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer select-none transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-purple-600' : 'text-slate-400'}`} />
          <span>Sync DB Metrics</span>
        </button>
      </div>

      {/* Dashboard KPI terminal - Only shows on main dashboard view or summary */}
      {activeTab === "admin_dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">SYSTEM ACTIVE USERS</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{users.length} Users</span>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-slate-700"><Users className="h-5.5 w-5.5" /></div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">DEPLOYED COURSES</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{courses.filter(c => !c.archived).length} Modules</span>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-emerald-600"><BookOpen className="h-5.5 w-5.5" /></div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">CPU CORES LOAD</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{systemMetric.cpuLoad}%</span>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-600"><Cpu className="h-5.5 w-5.5" /></div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">API HEALTH RATE</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">{systemMetric.apiSuccessRate}%</span>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-150 p-3 text-emerald-600"><Activity className="h-5.5 w-5.5" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-slate-800 lg:col-span-1">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block">PLATFORM ACCESS CONTROLS</span>
                <h3 className="text-lg font-black mt-1">Management Matrix Secure Node</h3>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  As an authenticated Administrator, you are issued full transactional powers. Toggle through the sidebar tabs to carry out strict CRUD database modifications over standard lessons, evaluative quizzes, question grids, and student classifications.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500 leading-normal">
                Signed ID: {loggedUser?.fullName || "System Admin Pro"}<br />
                Security Clearance Level: SEC-L5<br />
                Local Connection Tunnel: 0.0.0.0:3000
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
              <div>
                <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-3">
                  <Server className="h-5 w-5 text-slate-500" /> Infrastructure Node Metrics
                </div>

                <div className="space-y-4 pt-4 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Database Active Connection Pool:</span>
                    <span className="font-bold text-slate-800">{systemMetric.dbPoolActive} ports open</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Telemetry API response Latency:</span>
                    <span className="font-bold text-slate-800">{systemMetric.serverLatenyMs} ms standard</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Redis In-Memory Hit Rate:</span>
                    <span className="font-bold text-emerald-600">{systemMetric.redisHits}% hits</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-[11px] leading-relaxed text-slate-500 font-medium mt-4">
                <strong>System Engine Status:</strong> Docker configuration container running fully secure behind Nginx reverse proxies. Standard SSL port 3000 secure mapping active.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 1: MANAGE COURSES (admin_courses)
         ========================================================================= */}
      {activeTab === "admin_courses" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create/Edit Course Form */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
              {editingCourse ? (
                <span className="text-purple-600 flex items-center gap-1"><Edit className="h-4 w-4" /> Edit Course Config</span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1"><Plus className="h-4 w-4" /> Assemble New Course Node</span>
              )}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ex: Advanced PostgreSQL Tuning..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Description Details</label>
                <textarea
                  required
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Provide comprehensive objectives summary..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cover Thumbnail Image URL</label>
                <input
                  type="url"
                  value={courseThumb}
                  onChange={(e) => setCourseThumb(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-50/50 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Category Tag</label>
                  <select 
                    value={courseCat} 
                    onChange={(e) => setCourseCat(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-2 text-xs bg-slate-50/55 font-bold cursor-pointer text-slate-700"
                  >
                    <option>Web Development</option>
                    <option>Artificial Intelligence</option>
                    <option>Development</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Module Level</label>
                  <select
                    value={courseLvl}
                    onChange={(e) => setCourseLvl(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-2 text-xs bg-slate-50/55 font-bold cursor-pointer text-slate-700"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Virtual Study Hours (Est.)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={courseHours}
                  onChange={(e) => setCourseHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-slate-50/50 text-slate-800 font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingCourse ? "Synchronize course modifications" : "Deploy Course Node"}</span>
                </button>

                {editingCourse && (
                  <button
                    type="button"
                    onClick={clearCourseForm}
                    className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 px-3.5 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Courses for CRUD overview */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-550" /> System Active Courses Grid
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {courses.filter(c => !c.archived).map((course) => (
                <div 
                  key={course.id}
                  className="rounded-2xl border border-slate-100 p-4 hover:border-purple-200 transition-all flex flex-col md:flex-row justify-between gap-4 bg-slate-50/30"
                >
                  <div className="flex gap-3">
                    <img
                      src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&q=80&w=200"}
                      alt=""
                      className="w-16 h-12 rounded-lg object-cover bg-slate-100"
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{course.title}</h4>
                      <div className="flex gap-2 mt-1.5">
                        <span className="rounded bg-slate-200/50 text-slate-600 font-mono text-[9px] font-bold uppercase px-1.5 py-0.5">
                          {course.category}
                        </span>
                        <span className="rounded bg-purple-50 text-purple-600 font-mono text-[9px] font-bold px-1.5 py-0.5">
                          {course.level}
                        </span>
                        <span className="text-slate-400 font-semibold text-[10px] font-mono">
                          {course.durationHours} hrs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 md:self-center">
                    <button
                      onClick={() => handleEditCourseClick(course)}
                      className="rounded-lg p-2 bg-white border border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-100 transition-colors cursor-pointer"
                      title="Edit Course Meta Parameters"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setActiveTab("admin_lessons");
                      }}
                      className="rounded-lg py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold font-mono text-[10px] transition-colors cursor-pointer"
                    >
                      Lessons ({course.id ? "Inspect" : "0"})
                    </button>

                    <button
                      onClick={() => {
                        setQuizCourseId(course.id);
                        setActiveTab("admin_quizzes");
                      }}
                      className="rounded-lg py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold font-mono text-[10px] transition-colors cursor-pointer"
                    >
                      Quiz & Questions
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="rounded-lg p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Archive Course Node"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 2: MANAGE LESSONS (admin_lessons)
         ========================================================================= */}
      {activeTab === "admin_lessons" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Operations Context Selector</span>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-1.5">
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="rounded-xl border border-slate-200 py-2.5 px-3 text-xs bg-slate-50/50 font-bold text-slate-800 cursor-pointer w-full md:w-80"
              >
                <option value="">-- Choose Course to Edit Lessons --</option>
                {courses.filter(c => !c.archived).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {selectedCourseId && (
                <p className="text-[11px] text-slate-500 font-medium">Loaded {courseLessons.length} lesson node nodes from db.</p>
              )}
            </div>
          </div>

          {selectedCourseId ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Add/Edit Lesson prompt form */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
                <h3 className="text-sm font-extrabold pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  {editingLesson ? (
                    <span className="text-purple-600 flex items-center gap-1"><Edit className="h-4 w-4" /> Mode: Synchronize Lesson</span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1"><Plus className="h-4 w-4" /> Add Lesson Node</span>
                  )}
                </h3>

                <form onSubmit={handleSaveLesson} className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Lesson/Module Title</label>
                    <input
                      type="text"
                      required
                      value={lesTitle}
                      onChange={(e) => setLesTitle(e.target.value)}
                      placeholder="Ex: Fundamental Type Operations"
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-hidden focus:border-purple-550 bg-slate-50/50 text-slate-800 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Content Formatting Type</label>
                    <select
                      value={lesType}
                      onChange={(e) => setLesType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-2 text-xs bg-slate-50/50 font-bold"
                    >
                      <option value="text">Text Markdown (.md support)</option>
                      <option value="video">Streaming Media (Internal mp4 Link)</option>
                      <option value="html">Structured Rich HTML Markup</option>
                    </select>
                  </div>

                  {lesType === "video" && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Storage Video Stream URL</label>
                      <input
                        type="url"
                        value={lesUrl}
                        onChange={(e) => setLesUrl(e.target.value)}
                        placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                        className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs bg-slate-50/50 font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Lesson Duration (minutes)</label>
                    <input
                      type="number"
                      required
                      value={lesDuration}
                      onChange={(e) => setLesDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs bg-slate-50/50 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Main Body Content (Supports HTML, Text or Markdowns)</label>
                    <textarea
                      required
                      rows={8}
                      value={lesContent}
                      onChange={(e) => setLesContent(e.target.value)}
                      placeholder="# Heading\nWrite lesson text block content here. Dynamic code blocks, formulas are compiled correctly."
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-hidden focus:border-purple-550 bg-slate-50/50 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-150">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-xl bg-purple-650 hover:bg-purple-700 bg-purple-600 text-white font-bold py-2.5 px-4 text-xs shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{editingLesson ? "Commit Modifications" : "Assemble Node"}</span>
                    </button>
                    {editingLesson && (
                      <button
                        type="button"
                        onClick={clearLessonForm}
                        className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 px-3 text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lesson items matrix overview */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-100">
                  Established Core Lessons Map
                </h3>

                <div className="space-y-3">
                  {courseLessons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                      No active lesson records exist for this course node on db. Load first.
                    </div>
                  ) : (
                    courseLessons.map((les, index) => (
                      <div 
                        key={les.id} 
                        className="rounded-2xl border border-slate-100 p-4 hover:border-purple-200 transition-all bg-slate-50/20 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 rounded px-1.5 py-0.5">
                              NODE #{index + 1}
                            </span>
                            <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-slate-400 bg-slate-100 px-1 rounded">
                              {les.contentType}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-800 mt-1">{les.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium font-mono">{les.durationMinutes} mins estimated index time</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditLesson(les)}
                            className="rounded-lg p-2 bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-100 transition-colors cursor-pointer"
                            title="Edit Lesson Content"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteLesson(les.id, les.title)}
                            className="rounded-lg p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Erase Lesson Node"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400 font-medium">
              Please choose a course in the selector above to manage its core lessons parameters.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         VIEW 3: MANAGE QUIZZES & TESTS (admin_quizzes)
         ========================================================================= */}
      {activeTab === "admin_quizzes" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Course Select Matrix</span>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-1.5">
              <select 
                value={quizCourseId}
                onChange={(e) => setQuizCourseId(e.target.value)}
                className="rounded-xl border border-slate-200 py-2.5 px-3 text-xs bg-slate-50/50 font-bold text-slate-800 cursor-pointer w-full md:w-80"
              >
                <option value="">-- Choose Course to Configure Quiz --</option>
                {courses.filter(c => !c.archived).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {quizCourseId ? (
            <div className="space-y-8">
              
              {/* Quiz parameter configuration form */}
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm max-w-4xl">
                <span className="text-[10px] font-bold text-purple-650 font-mono tracking-widest uppercase block mb-1">EVALUATION METRIC PARAMETERS</span>
                <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  Configure Quiz Rules Frame
                </h3>

                <form onSubmit={handleSaveQuizConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                  <div className="space-y-1 block md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Evaluative Quiz/Test Name</label>
                    <input
                      type="text"
                      required
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Ex: CSS Mastery and layouts evaluation exam"
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1 block md:col-span-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Passing score rate (%)</label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="100"
                      value={quizPassingScore}
                      onChange={(e) => setQuizPassingScore(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1 block">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Exam Time Limit (minutes)</label>
                    <input
                      type="number"
                      required
                      min="2"
                      value={quizTimeLimit}
                      onChange={(e) => setQuizTimeLimit(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-mono font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="md:self-end rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save className="h-4 w-4" /> Save Quiz Config
                  </button>
                </form>
              </div>

              {/* Questions database CRUD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Add/Edit question widget form */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
                  <span className="text-[10px] font-extrabold text-emerald-650 font-mono tracking-widest uppercase block">QUERY GENERATION NODE</span>
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    {editingQuestion ? (
                      <span className="text-purple-600 flex items-center gap-1"><Edit className="h-4 w-4" /> Modify Question</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1"><Plus className="h-4 w-4" /> Add Evaluation Question</span>
                    )}
                  </h3>

                  <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Evaluation Prompt Text</label>
                      <textarea
                        required
                        rows={3}
                        value={questText}
                        onChange={(e) => setQuestText(e.target.value)}
                        placeholder="Ex: Which CSS layout geometry facilitates fluid inline wraps?"
                        className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs font-semibold leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Verification Style</label>
                      <select
                        value={questType}
                        onChange={(e) => {
                          setQuestType(e.target.value as any);
                          if (e.target.value === "boolean") {
                            setQuestOptions(["True", "False"]);
                          } else if (questOptions.length < 2) {
                            setQuestOptions(["", ""]);
                          }
                          setQuestCorrect([]);
                        }}
                        className="w-full rounded-xl border border-slate-200 py-2 px-2 text-xs font-bold"
                      >
                        <option value="single">Single Choice Radio</option>
                        <option value="multiple">Multiple Correct Checks</option>
                        <option value="boolean">Logical Binary (True/False)</option>
                      </select>
                    </div>

                    {questType !== "boolean" && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Answers Option Matrix</label>
                          <button
                            type="button"
                            onClick={handleAddOptionField}
                            className="rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold px-2 py-1 text-[9px] cursor-pointer"
                          >
                            + Option row
                          </button>
                        </div>

                        <div className="space-y-2">
                          {questOptions.map((opt, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCorrectIndex(String(i))}
                                className={`rounded px-2.5 py-2 font-mono text-xs font-black select-none ${
                                  questCorrect.includes(String(i)) 
                                    ? "bg-purple-600 text-white shadow-sm" 
                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                }`}
                                title={questCorrect.includes(String(i)) ? "Correct option" : "Mark as correct version option"}
                              >
                                {questCorrect.includes(String(i)) ? "✔" : i}
                              </button>
                              
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionTextChange(i, e.target.value)}
                                placeholder={`Label option #${i}...`}
                                className="flex-1 rounded-lg border border-slate-200 py-1.5 px-2 text-xs font-medium"
                              />

                              <button
                                type="button"
                                onClick={() => handleRemoveOptionField(i)}
                                className="rounded text-red-500 hover:bg-red-50 p-1.5"
                                title="Remove row"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {questType === "boolean" && (
                      <div className="space-y-2 text-xs font-sans">
                        <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Correct Logical Value</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setQuestCorrect(["0"])}
                            className={`flex-1 py-3 text-center border font-bold rounded-xl cursor-pointer ${
                              questCorrect.includes("0") 
                                ? "bg-purple-600 border-purple-650 text-white" 
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            True Logical Accent
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuestCorrect(["1"])}
                            className={`flex-1 py-3 text-center border font-bold rounded-xl cursor-pointer ${
                              questCorrect.includes("1") 
                                ? "bg-purple-600 border-purple-650 text-white" 
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            False Logical Accent
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-slate-150">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{editingQuestion ? "Commit Modifications" : "Deploy Question"}</span>
                      </button>
                      
                      {editingQuestion && (
                        <button
                          type="button"
                          onClick={clearQuestionForm}
                          className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2 px-3 text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Questions listing */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800 pb-2 border-b border-slate-100">
                    Question Index Stack
                  </h3>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {quizQuestions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                        No active question objects mapped inside this quiz catalog. Add above.
                      </div>
                    ) : (
                      quizQuestions.map((q, index) => (
                        <div 
                          key={q.id} 
                          className="rounded-2xl border border-slate-100 p-4 hover:border-purple-200 transition-all bg-slate-50/20 space-y-3"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 rounded px-1.5 py-0.5">
                                  Q#{index + 1}
                                </span>
                                <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-slate-400 bg-slate-100 px-1 rounded">
                                  {q.questionType} Choice
                                </span>
                              </div>
                              <p className="font-extrabold text-xs text-slate-800 leading-normal mt-1.5">{q.text}</p>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => handleEditQuestion(q)}
                                className="rounded px-2 py-1 bg-white border border-slate-200 hover:border-purple-200 text-slate-500 hover:text-purple-650 cursor-pointer"
                                title="Edit Question Parameters"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="rounded px-2 py-1 bg-red-50 text-red-650 hover:bg-red-100 text-red-600 cursor-pointer"
                                title="Erase question index"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-medium font-sans pl-2 border-l border-slate-250">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`rounded px-2 py-1.5 flex items-center gap-1.5 ${
                                  q.correctAnswers.includes(String(oIdx)) 
                                    ? "bg-purple-100/50 border border-purple-200 text-purple-800 font-bold" 
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                <span className={`text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold ${
                                  q.correctAnswers.includes(String(oIdx)) 
                                    ? "bg-purple-600 text-white" 
                                    : "bg-slate-200 text-slate-650"
                                }`}>
                                  {oIdx}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400 font-medium">
              Please select a course module from the selector above to manage its evaluation quiz & tests.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         VIEW 4: SYSTEM USERS (admin_users)
         ========================================================================= */}
      {activeTab === "admin_users" && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-655 text-purple-600" /> User Directory Management
              </h3>
              <p className="text-[11.5px] text-zinc-500 font-medium">System records registry. Authorize roles or terminate access profiles.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Prof. Name</th>
                  <th className="px-4 py-3">Email Key</th>
                  <th className="px-4 py-3">System Access Role</th>
                  <th className="px-4 py-3">Telemetry Streak</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3 text-right">Core Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 border-b border-slate-50 select-text font-medium text-slate-700">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{u.fullName}</td>
                    <td className="px-4 py-3 font-mono">{u.email}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className={`inline-block rounded-md px-2 py-0.5 font-bold font-mono text-[9px] uppercase ${u.role === "ADMIN" ? "bg-purple-100 text-purple-705 font-black uppercase text-purple-700" : "bg-emerald-50 text-emerald-700 text-emerald-750 font-bold"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{u.streak || 0} days</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{u.createdAt?.split("T")[0]}</td>
                    <td className="px-4 py-3 text-right space-x-1.5 shrink-0 block">
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        disabled={u.id === "usr_admin" || loading}
                        className="rounded-lg px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-650 hover:border-purple-200 hover:text-purple-650 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Swap Admin/Student privilege"
                      >
                        Swap Role
                      </button>
                      <button
                        onClick={() => handlePermanentKillUser(u.id, u.fullName)}
                        disabled={u.id === "usr_admin" || loading}
                        className="rounded-lg p-1.5 bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Delete User permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 5: DETAILED REVIEWS OPERATIONAL AUDIT LOGS (admin_logs)
         ========================================================================= */}
      {activeTab === "admin_logs" && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-600" /> Operational System Audits Logs
              </h3>
              <p className="text-[11.5px] text-zinc-500 font-medium">Secured infrastructure transaction logs pulling directly from learnmatrix filesystems.</p>
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                placeholder="Search specific user/actions..."
                className="w-full rounded-xl border border-slate-200 py-1.5 px-3 text-xs bg-slate-50/50 outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2 select-text font-mono text-[11px] divide-y divide-slate-105 pr-1">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-sans font-medium">
                No matching infrastructure audit records matched your text query.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="pt-2 flex items-start gap-4 justify-between leading-6 hover:bg-slate-50/30 transition-colors">
                  <div>
                    <span className="text-emerald-600 font-bold">[{log.userName}]</span>
                    <span className="text-slate-700 ml-1.5 font-bold font-mono text-[11.5px] uppercase">{log.action}:</span>
                    <span className="text-slate-500 ml-1.5 text-[11.5px] font-medium leading-relaxed">{log.details}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-right whitespace-nowrap shrink-0 block">
                    <span>{log.id?.split("_")[1] ? new Date(Number(log.id.split("_")[1])).toLocaleTimeString() : log.timestamp?.split("T")[1]?.slice(0, 8)}</span>
                    <span className="block text-[9px] text-slate-300 font-normal">{log.timestamp?.split("T")[0]}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
