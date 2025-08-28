// Shared mock courses store (to be replaced with real DB integration)
export interface SharedCourseSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  instructor: string;
  students: number;
  lessons: number;
  completionRate: number;
  createdAt: string; // ISO date
  lastUpdated: string; // ISO date
  image?: string;
}

export const sharedCourses: SharedCourseSummary[] = [
  {
    id: '1',
    title: 'Cálculo Diferencial',
    description: 'Fundamentos del cálculo diferencial para ingeniería y ciencias',
    category: 'matematicas',
    status: 'active',
    instructor: 'Dr. García',
    students: 45,
    lessons: 24,
    completionRate: 78,
    createdAt: '2025-01-15',
    lastUpdated: '2025-08-20',
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    title: 'Álgebra Lineal',
    description: 'Matrices, determinantes, espacios vectoriales y más',
    category: 'matematicas',
    status: 'active',
    instructor: 'Dra. Martínez',
    students: 28,
    lessons: 20,
    completionRate: 62,
    createdAt: '2025-02-01',
    lastUpdated: '2025-08-18'
  },
  {
    id: '3',
    title: 'Python Básico',
    description: 'Aprende los fundamentos de Python desde cero',
    category: 'programacion',
    status: 'active',
    instructor: 'Ing. López',
    students: 67,
    lessons: 30,
    completionRate: 100,
    createdAt: '2024-12-10',
    lastUpdated: '2025-07-30'
  }
];
