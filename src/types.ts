/**
 * LearnMatrix LMS Platforms Types
 */

export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR"
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  streak: number;
  lastActiveDate?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  instructorId: string;
  instructorName: string;
  thumbnailUrl: string;
  published: boolean;
  archived: boolean;
  createdAt: string;
  durationHours: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  contentType: "video" | "text" | "html";
  contentUrl?: string; // video URL or content attachment
  orderIndex: number;
  durationMinutes: number;
  published: boolean;
}

export interface StudentLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progressPercentage: number;
  finished: boolean;
  finishedAt?: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  questionType: "single" | "multiple" | "boolean";
  options: string[]; // Options for choice
  correctAnswers: string[]; // Array of correct index options (as strings like "0", "1")
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  passingScore: number; // e.g. 70
  timeLimitMinutes: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  score: number; // Calculated score percentage (0-100)
  passed: boolean;
  attemptedAt: string;
  answers: { [questionId: string]: string[] }; // user selected index arrays
}

export interface Recommendation {
  id: string;
  userId: string;
  courseId: string; // Course associated with the recommendation
  scoreReceived: number;
  recommendationType: "PROCEED" | "REVISE" | "BACK_TO_BASICS";
  suggestedCourseId?: string;
  feedbackText: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  userId: string;
  activityDate: string; // YYYY-MM-DD
  minutesSpent: number;
}

export interface StudentAnalytics {
  userId: string;
  completedLessons: number;
  completedCourses: number;
  averageQuizScore: number;
  certificatesEarned: number;
  totalHoursStudied: number;
  studyStreaks: number;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  verificationCode: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // e.g. "Create Lesson", "Login", "Submit Quiz"
  timestamp: string;
  details: string;
}

export interface SystemMetric {
  activeUsers24h: number;
  cpuLoad: number;
  apiSuccessRate: number;
  serverLatenyMs: number;
  dbPoolActive: number;
  redisHits: number;
  timestamp: string;
}
