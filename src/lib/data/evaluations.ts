export interface SharedEvaluationSummary {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'simulacro';
  courseId: string; // reference to sharedCourses.id
  status: 'draft' | 'active' | 'finished' | 'archived';
  timeLimit: number;
  questions: number;
  maxAttempts: number;
  passingScore: number;
  createdDate: string;
  publishDate?: string;
  dueDate?: string;
  totalResponses: number;
  averageScore: number;
  passRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const sharedEvaluations: SharedEvaluationSummary[] = [
  {
    id: 'e1',
    title: 'Quiz: Derivadas e Integrales',
    description: 'Evaluación sobre conceptos básicos de derivadas e integrales',
    type: 'quiz',
    courseId: '1',
    status: 'active',
    timeLimit: 45,
    questions: 15,
    maxAttempts: 2,
    passingScore: 70,
    createdDate: '2025-08-10',
    publishDate: '2025-08-12',
    dueDate: '2025-09-01',
    totalResponses: 28,
    averageScore: 82,
    passRate: 85,
    difficulty: 'medium'
  },
  {
    id: 'e2',
    title: 'Simulacro ICFES Matemáticas',
    description: 'Simulacro tipo ICFES para preparación de examen de estado',
    type: 'simulacro',
    courseId: '1',
    status: 'draft',
    timeLimit: 90,
    questions: 25,
    maxAttempts: 3,
    passingScore: 50,
    createdDate: '2025-08-20',
    totalResponses: 0,
    averageScore: 0,
    passRate: 0,
    difficulty: 'medium'
  }
];
