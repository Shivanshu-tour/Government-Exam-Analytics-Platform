export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface ExamCycle {
  id: number;
  exam_id: number;
  year: number;
  notification_date?: string;
  application_start?: string;
  application_end?: string;
  prelims_date?: string;
  mains_date?: string;
  result_date?: string;
  status: string;
}

export interface Exam {
  id: number;
  slug: string;
  name: string;
  organization: string;
  category: string;
  description?: string;
  official_website?: string;
  active: boolean;
  created_at: string;
  cycles_count?: number;
  latest_cycle_year?: number;
  total_vacancies_latest?: number;
  cycles?: ExamCycle[];
}

export interface Vacancy {
  id: number;
  exam_cycle_id: number;
  post: string;
  category: string;
  vacancies: number;
  source?: string;
  exam_name?: string;
  year?: number;
}

export interface Cutoff {
  id: number;
  exam_cycle_id: number;
  phase: string;
  category: string;
  section: string;
  cutoff: number;
  maximum_marks: number;
  source?: string;
  exam_name?: string;
  year?: number;
}

export interface Subtopic {
  id: number;
  topic_id: number;
  name: string;
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  user_status?: 'Not Started' | 'Learning' | 'Revised' | 'Strong';
  subtopics: Subtopic[];
}

export interface Subject {
  id: number;
  exam_id: number;
  name: string;
  phase: string;
  topics: Topic[];
}

export interface Question {
  id: number;
  exam_id: number;
  exam_name?: string;
  year: number;
  phase: string;
  subject_id: number;
  subject_name?: string;
  topic_id: number;
  topic_name?: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult';
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface MockResult {
  id: number;
  subject_id: number;
  subject_name?: string;
  attempted: number;
  correct: number;
  incorrect: number;
  score: number;
  time_taken: number;
}

export interface MockTest {
  id: number;
  user_id: number;
  exam_id: number;
  exam_name?: string;
  name: string;
  date: string;
  created_at: string;
  total_score: number;
  total_attempted: number;
  total_correct: number;
  total_incorrect: number;
  accuracy: number;
  attempt_rate: number;
  error_rate: number;
  results: MockResult[];
}

export interface WeakTopic {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  exam_name: string;
  accuracy: number;
  avg_time: number;
  attempts: number;
  recent_accuracy: number;
  reasons: string[];
  recommendation: string;
}

export interface UserPerformance {
  study_streak_days: number;
  mocks_completed: number;
  average_score: number;
  average_accuracy: number;
  syllabus_completion_percent: number;
  status_breakdown: Record<string, number>;
  score_trend: Array<{ mock_id: number; mock_name: string; date: string; score: number; accuracy: number }>;
  accuracy_trend: Array<{ date: string; accuracy: number }>;
  subject_performance: Array<{ subject: string; attempted: number; correct: number; total_score: number; accuracy: number }>;
  weak_areas_count: number;
  strong_areas_count: number;
}
