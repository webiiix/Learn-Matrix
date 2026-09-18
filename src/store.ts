import { configureStore, createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, Course, Lesson, Enrollment, StudentLessonProgress, Quiz, QuizAttempt, Recommendation, Certificate, AuditLog, SystemMetric } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const getStoredAuth = () => {
  const userStr = localStorage.getItem("lm_user");
  const token = localStorage.getItem("lm_token");
  try {
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token: token || null,
    };
  } catch {
    return { user: null, token: null };
  }
};

const initialAuthState: AuthState = {
  ...getStoredAuth(),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; fullName?: string; isRegister?: boolean }, { rejectWithValue }) => {
    try {
      const endpoint = credentials.isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = credentials.isRegister 
        ? { email: credentials.email, fullName: credentials.fullName || "Student", password: "password123" }
        : { email: credentials.email, password: "password123" };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || "Authentication failed");
      }

      localStorage.setItem("lm_token", data.token);
      localStorage.setItem("lm_user", JSON.stringify(data.user));
      return data;
    } catch (e: any) {
      return rejectWithValue(e.message || "Network error");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("lm_token");
  localStorage.removeItem("lm_user");
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem("lm_user", JSON.stringify(action.payload));
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

interface CourseState {
  courses: Course[];
  lessons: { [courseId: string]: Lesson[] };
  enrollments: Enrollment[];
  progressList: StudentLessonProgress[];
  loading: boolean;
  error: string | null;
}

const initialCourseState: CourseState = {
  courses: [],
  lessons: {},
  enrollments: [],
  progressList: [],
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk("courses/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState() as { auth: AuthState };
    const response = await fetch("/api/courses", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (!response.ok) throw new Error("Failed to load courses");
    return await response.json();
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const enrollInCourse = createAsyncThunk(
  "courses/enroll",
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to enroll");
      return data; // returns { enrollment, enrolledLessonsProgress }
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const toggleLessonCompletion = createAsyncThunk(
  "courses/toggleLesson",
  async ({ lessonId, courseId }: { lessonId: string; courseId: string }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update lesson completion");
      return data; // returns { progress, enrollmentUpdated }
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState: initialCourseState,
  reducers: {
    addCourseLocal(state, action: PayloadAction<Course>) {
      state.courses.push(action.payload);
    },
    updateCourseLocal(state, action: PayloadAction<Course>) {
      const index = state.courses.findIndex(c => c.id === action.payload.id);
      if (index !== -1) state.courses[index] = action.payload;
    },
    deleteCourseLocal(state, action: PayloadAction<string>) {
      state.courses = state.courses.filter(c => c.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.enrollments = action.payload.enrollments;
        state.progressList = action.payload.progressList;
        state.lessons = action.payload.lessonsMap || {};
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollments.push(action.payload.enrollment);
        state.progressList.push(...action.payload.enrolledLessonsProgress);
      })
      .addCase(toggleLessonCompletion.fulfilled, (state, action) => {
        const index = state.progressList.findIndex(
          p => p.lessonId === action.payload.progress.lessonId
        );
        if (index !== -1) {
          state.progressList[index] = action.payload.progress;
        } else {
          state.progressList.push(action.payload.progress);
        }
        
        const enrollIndex = state.enrollments.findIndex(
          e => e.courseId === action.payload.enrollmentUpdated.courseId
        );
        if (enrollIndex !== -1) {
          state.enrollments[enrollIndex] = action.payload.enrollmentUpdated;
        }
      });
  },
});

interface QuizState {
  attempts: QuizAttempt[];
  recommendations: Recommendation[];
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

const initialQuizState: QuizState = {
  attempts: [],
  recommendations: [],
  certificates: [],
  loading: false,
  error: null,
};

export const submitQuiz = createAsyncThunk(
  "quiz/submit",
  async (
    submission: { quizId: string; answers: { [qId: string]: string[] } },
    { getState, rejectWithValue }
  ) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await fetch(`/api/quizzes/${submission.quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ answers: submission.answers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submission failed");
      return data; // returns { attempt, recommendation, certificateCode, userPassed }
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchQuizHistory = createAsyncThunk(
  "quiz/history",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await fetch("/api/quizzes/history", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) throw new Error("Failed to load history");
      return await response.json(); // returns { attempts, recommendations, certificates }
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState: initialQuizState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.attempts.push(action.payload.attempt);
        if (action.payload.recommendation) {
          state.recommendations.push(action.payload.recommendation);
        }
        if (action.payload.certificate) {
          state.certificates.push(action.payload.certificate);
        }
      })
      .addCase(fetchQuizHistory.fulfilled, (state, action) => {
        state.attempts = action.payload.attempts || [];
        state.recommendations = action.payload.recommendations || [];
        state.certificates = action.payload.certificates || [];
      });
  },
});

interface AdminState {
  auditLogs: AuditLog[];
  metrics: SystemMetric[];
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialAdminState: AdminState = {
  auditLogs: [],
  metrics: [],
  users: [],
  loading: false,
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!response.ok) throw new Error("Failed validation or authorization");
      return await response.json(); // returns { auditLogs, metrics, users }
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: initialAdminState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.auditLogs = action.payload.auditLogs;
        state.metrics = action.payload.metrics;
        state.users = action.payload.users;
      });
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    courses: courseSlice.reducer,
    quiz: quizSlice.reducer,
    admin: adminSlice.reducer,
  },
});

export const { updateUser, clearError } = authSlice.actions;
export const { addCourseLocal, updateCourseLocal, deleteCourseLocal } = courseSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
