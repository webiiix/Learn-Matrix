import React, { useState, useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store, RootState, fetchCourses, fetchQuizHistory } from "./store";

// Layout components
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";

// Feature views
import { LandingPage } from "./components/LandingPage";
import { AuthScreens } from "./components/AuthScreens";
import { MainDashboard } from "./components/MainDashboard";
import { CourseCatalog } from "./components/CourseCatalog";
import { LessonViewer } from "./components/LessonViewer";
import { QuizEngine } from "./components/QuizEngine";
import { StudentAnalytics } from "./components/StudentAnalytics";
import { ReportingCertificates } from "./components/ReportingCertificates";
import { AdminControls } from "./components/AdminControls";
import { ProfileView } from "./components/ProfileView";

function AppContent() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Navigation tab key state coordinator
  const [activeTab, setActiveTab] = useState<string>("landing");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Sync initial datasets upon successful authentication verify
  useEffect(() => {
    if (token) {
      (dispatch as any)(fetchCourses());
      (dispatch as any)(fetchQuizHistory());
      
      // Auto upgrade tab if logged in
      if (activeTab === "landing" || activeTab === "login") {
        if (user && user.role === "ADMIN") {
          setActiveTab("admin_dashboard");
        } else {
          setActiveTab("dashboard");
        }
      }
    } else {
      if (activeTab !== "landing") {
        setActiveTab("login");
      }
    }
  }, [token, dispatch, user]);

  const renderActiveTabContent = () => {
    if (!token && activeTab !== "landing") {
      return (
        <AuthScreens 
          onSuccess={() => {
            if (user && user.role === "ADMIN") {
              setActiveTab("admin_dashboard");
            } else {
              setActiveTab("dashboard");
            }
          }} 
        />
      );
    }

    switch (activeTab) {
      case "landing":
        return (
          <LandingPage 
            onStart={() => {
              if (token) {
                if (user && user.role === "ADMIN") setActiveTab("admin_dashboard");
                else setActiveTab("dashboard");
              }
              else setActiveTab("login");
            }} 
          />
        );
      
      case "login":
        return (
          <AuthScreens 
            onSuccess={() => {
              if (user && user.role === "ADMIN") {
                setActiveTab("admin_dashboard");
              } else {
                setActiveTab("dashboard");
              }
            }} 
          />
        );

      case "dashboard":
        return (
          <MainDashboard 
            setActiveTab={setActiveTab}
            setSelectedCourseId={(courseId) => {
              setSelectedCourseId(courseId);
            }}
          />
        );

      case "courses":
        return (
          <CourseCatalog 
            onSelectCourse={(courseId) => {
              setSelectedCourseId(courseId);
            }}
            setActiveTab={setActiveTab}
          />
        );

      case "lessons_viewer":
        if (!selectedCourseId) {
          // fallback to first course available
          return (
            <div className="p-12 text-center text-gray-500">
              No course loaded. Choose a catalog node first.
              <button 
                onClick={() => setActiveTab("courses")} 
                className="mt-4 block mx-auto rounded-xl bg-slate-900 text-white font-bold py-2 px-4 text-xs"
              >
                Go to Catalog
              </button>
            </div>
          );
        }
        return (
          <LessonViewer 
            courseId={selectedCourseId}
            onBack={() => {
              setActiveTab("courses");
              setSelectedCourseId(null);
            }}
            setActiveTab={setActiveTab}
            setSelectedQuizId={(quizId) => {
              setSelectedQuizId(quizId);
            }}
          />
        );

      case "quiz_page":
        if (!selectedQuizId) {
          return (
            <div className="p-12 text-center text-gray-500 font-mono">
              Matrix quiz key ID not loaded. Select course first.
            </div>
          );
        }
        return (
          <QuizEngine 
            quizId={selectedQuizId}
            onBack={() => {
              setActiveTab("dashboard");
              setSelectedQuizId(null);
            }}
            setActiveTab={setActiveTab}
          />
        );

      case "analytics":
        return <StudentAnalytics />;

      case "certificates":
      case "reports":
        return <ReportingCertificates />;

      case "admin":
      case "admin_dashboard":
      case "admin_courses":
      case "admin_lessons":
      case "admin_quizzes":
      case "admin_users":
      case "admin_logs":
        return <AdminControls defaultTab={activeTab} />;

      case "profile":
        return <ProfileView />;

      default:
        return (
          <div className="py-24 text-center text-gray-400 font-sans">
            Tab node "{activeTab}" is active.
          </div>
        );
    }
  };

  // If we are looking at Landing screen, render it without complex sidebar layout margins!
  if (activeTab === "landing") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Header />
        <main className="flex-1">
          {renderActiveTabContent()}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Header component */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Sidebar component (Collapses when no active user session) */}
        {token && (
          <Sidebar 
            activeTab={activeTab === "lessons_viewer" ? "courses" : activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              // Clean selection scopes when switching root modules!
              if (tab !== "lessons_viewer") {
                setSelectedCourseId(null);
                setSelectedQuizId(null);
              }
            }} 
          />
        )}

        {/* 3. Main core view workspace viewport */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
