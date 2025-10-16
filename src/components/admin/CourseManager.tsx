'use client'

import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  TrendingUp,
  Star,
  Clock,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import styles from './CourseManager.module.css';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  servicio: string;
  status: 'active' | 'draft' | 'archived';
  students: number;
  lessons: number;
  completionRate: number;
  rating: number;
  image: string;
  createdAt: Date;
  lastUpdated: Date;
  instructor: string;
}

interface CourseManagerProps {
  viewMode: 'cards' | 'list';
  filters: {
    search: string;
    category: string;
    status: string;
    sortBy: string;
  };
  onEditCourse: (course: Course) => void;
}

const CourseManager: React.FC<CourseManagerProps> = ({ 
  viewMode, 
  filters, 
  onEditCourse 
}) => {
  // Datos de ejemplo - en producción vendrían de la base de datos
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Cálculo Diferencial',
      description: 'Curso completo de cálculo diferencial para estudiantes de ingeniería',
      category: 'matematicas',
      servicio: 'ICFES',
      status: 'active',
      students: 45,
      lessons: 24,
      completionRate: 78,
      rating: 4.8,
      image: '/api/placeholder/300/200',
      createdAt: new Date('2024-01-15'),
      lastUpdated: new Date('2024-12-01'),
      instructor: 'Prof. García'
    },
    {
      id: '2',
      title: 'Física Cuántica',
      description: 'Introducción a los principios fundamentales de la física cuántica',
      category: 'fisica',
      servicio: 'Saber Pro',
      status: 'active',
      students: 32,
      lessons: 18,
      completionRate: 85,
      rating: 4.9,
      image: '/api/placeholder/300/200',
      createdAt: new Date('2024-02-10'),
      lastUpdated: new Date('2024-11-28'),
      instructor: 'Prof. López'
    },
    {
      id: '3',
      title: 'Programación Python',
      description: 'Curso básico de programación en Python desde cero',
      category: 'programacion',
      servicio: 'Cursos Especializados',
      status: 'draft',
      students: 0,
      lessons: 15,
      completionRate: 0,
      rating: 0,
      image: '/api/placeholder/300/200',
      createdAt: new Date('2024-11-15'),
      lastUpdated: new Date('2024-12-02'),
      instructor: 'Prof. Martínez'
    },
    {
      id: '4',
      title: 'Química Orgánica',
      description: 'Fundamentos de química orgánica aplicada',
      category: 'quimica',
      servicio: 'Admisiones',
      status: 'active',
      students: 28,
      lessons: 20,
      completionRate: 92,
      rating: 4.7,
      image: '/api/placeholder/300/200',
      createdAt: new Date('2024-03-01'),
      lastUpdated: new Date('2024-11-30'),
      instructor: 'Prof. Ruiz'
    },
    {
      id: '5',
      title: 'Álgebra Linear',
      description: 'Conceptos avanzados de álgebra linear y matrices',
      category: 'matematicas',
      servicio: 'Corporativo',
      status: 'archived',
      students: 67,
      lessons: 22,
      completionRate: 95,
      rating: 4.6,
      image: '/api/placeholder/300/200',
      createdAt: new Date('2023-09-10'),
      lastUpdated: new Date('2024-01-15'),
      instructor: 'Prof. Silva'
    }
  ]);

  // Filtrar cursos según los filtros aplicados
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         course.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || course.category === filters.category;
    const matchesStatus = filters.status === 'all' || course.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Ordenar cursos
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'students':
        return b.students - a.students;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const handleDuplicateCourse = (course: Course) => {
    const newCourse = {
      ...course,
      id: Date.now().toString(),
      title: `${course.title} (Copia)`,
      status: 'draft' as const,
      students: 0,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    setCourses([newCourse, ...courses]);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'draft':
        return '#f59e0b';
      case 'archived':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivado';
      default:
        return status;
    }
  };

  const categoryText = (category: string) => {
    switch (category) {
      case 'matematicas':
        return 'Matemáticas';
      case 'fisica':
        return 'Física';
      case 'programacion':
        return 'Programación';
      case 'quimica':
        return 'Química';
      default:
        return category;
    }
  };

  const Card = ({ course }: { course: Course }) => (
    <div className={styles.courseCard}>
      <div className={styles.courseImage}>
        <img src={course.image} alt={course.title} />
        <div className={styles.courseStatus} style={{ backgroundColor: statusColor(course.status) }}>
          {statusText(course.status)}
        </div>
      </div>
      
      <div className={styles.courseContent}>
        <div className={styles.courseHeader}>
          <div>
            <h3>{course.title}</h3>
            <span style={{ 
              padding:'0.125rem 0.5rem', 
              background:'#6366f120', 
              color:'#6366f1', 
              borderRadius:4, 
              fontSize:'0.625rem',
              fontWeight: '700',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
              display: 'inline-block',
              marginTop: '0.25rem'
            }}>
              {course.servicio}
            </span>
          </div>
          <div className={styles.courseActions}>
            <button className={styles.actionIcon} onClick={() => console.log('Ver curso')}>
              <Eye size={16} />
            </button>
            <button className={styles.actionIcon} onClick={() => onEditCourse(course)}>
              <Edit size={16} />
            </button>
            <button className={`${styles.actionIcon} ${styles.danger}`} onClick={() => handleDeleteCourse(course.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <p className={styles.courseDescription}>{course.description}</p>
        
        <div className={styles.courseMeta}>
          <span className={styles.courseCategory}>{categoryText(course.category)}</span>
          <span className={styles.courseInstructor}>{course.instructor}</span>
        </div>
        
        <div className={styles.courseStats}>
          <div className={styles.statItem}>
            <Users size={14} /> 
            <span>{course.students} estudiantes</span>
          </div>
          <div className={styles.statItem}>
            <BookOpen size={14} /> 
            <span>{course.lessons} lecciones</span>
          </div>
          <div className={styles.statItem}>
            <TrendingUp size={14} /> 
            <span>{course.completionRate}% completado</span>
          </div>
          {course.rating > 0 && (
            <div className={styles.statItem}>
              <Star size={14} /> 
              <span>{course.rating}/5</span>
            </div>
          )}
        </div>
        
        <div className={styles.courseFooter}>
          <small>Actualizado: {course.lastUpdated.toLocaleDateString()}</small>
          <div className={styles.courseMenu}>
            <button className={styles.menuBtn}>
              <MoreVertical size={16} />
            </button>
            <div className={styles.menuDropdown}>
              <button onClick={() => onEditCourse(course)}>Editar</button>
              <button onClick={() => handleDuplicateCourse(course)}>Duplicar</button>
              <button onClick={() => console.log('Ver estadísticas')}>Estadísticas</button>
              <button onClick={() => handleDeleteCourse(course.id)} className={styles.danger}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Row = ({ course }: { course: Course }) => (
    <div className={styles.courseListItem}>
      <div className={styles.courseInfo}>
        <div className={styles.courseTitleSection}>
          <h3>{course.title}</h3>
          <span style={{ 
            padding:'0.125rem 0.5rem', 
            background:'#6366f120', 
            color:'#6366f1', 
            borderRadius:4, 
            fontSize:'0.625rem',
            fontWeight: '700',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            marginLeft: '0.5rem'
          }}>
            {course.servicio}
          </span>
          <span className={styles.courseCategorySmall}>{categoryText(course.category)}</span>
        </div>
        <p className={styles.courseDescriptionSmall}>{course.description}</p>
        <div className={styles.courseStatsList}>
          <div className={styles.statItemList}>
            <Users size={12} /> 
            <span>{course.students}</span>
          </div>
          <div className={styles.statItemList}>
            <BookOpen size={12} /> 
            <span>{course.lessons}</span>
          </div>
          <div className={styles.statItemList}>
            <TrendingUp size={12} /> 
            <span>{course.completionRate}%</span>
          </div>
          {course.rating > 0 && (
            <div className={styles.statItemList}>
              <Star size={12} /> 
              <span>{course.rating}</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.courseStatusSection}>
        <div className={styles.statusBadge} style={{ backgroundColor: statusColor(course.status) }}>
          {statusText(course.status)}
        </div>
        <small>{course.lastUpdated.toLocaleDateString()}</small>
      </div>
      <div className={styles.courseActionsList}>
        <button className={styles.actionBtnSmall} onClick={() => console.log('Ver curso')}>
          <Eye size={14} />
        </button>
        <button className={styles.actionBtnSmall} onClick={() => onEditCourse(course)}>
          <Edit size={14} />
        </button>
        <button className={`${styles.actionBtnSmall} ${styles.danger}`} onClick={() => handleDeleteCourse(course.id)}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  if (sortedCourses.length === 0) {
    return (
      <div className={styles.emptyState}>
        <BookOpen size={56} />
        <h3>No se encontraron cursos</h3>
        <p>No hay cursos que coincidan con los filtros</p>
      </div>
    );
  }

  return (
    <div className={styles.courseManager}>
      {viewMode === 'cards' ? (
        <div className={styles.coursesGrid}>
          {sortedCourses.map(c => (
            <Card key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className={styles.coursesList}>
          <div className={styles.listHeader}>
            <div>Curso</div>
            <div>Estadísticas</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>
          {sortedCourses.map(c => (
            <Row key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseManager;
