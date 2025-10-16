'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Plus, Users, Calendar, Search, Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  duration_hours: number;
  max_students: number;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'published' | 'active' | 'completed';
  created_at: string;
  enrolled_count: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrollment_date: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
}

export default function AdminCourseManager() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [view, setView] = useState<'courses' | 'students'>('courses');

  const loadCourses = useCallback(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_enrollments(count)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
    } else {
      setCourses((data || []).map(course => ({
        ...course,
        enrolled_count: course.course_enrollments?.length || 0
      })));
    }
  }, [supabase]);

  const loadCourseStudents = useCallback(async (courseId: string) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        student:students(*)
      `)
      .eq('course_id', courseId);
    
    if (error) {
      setError(error.message);
    } else {
      setCourseStudents((data || []).map(enrollment => ({
        ...enrollment.student,
        enrollment_date: enrollment.created_at,
        progress: enrollment.progress,
        status: enrollment.status
      })));
    }
  }, [supabase]);

  const loadAvailableStudents = useCallback(async (courseId?: string) => {
    let query = supabase
      .from('students')
      .select(`
        *,
        course_enrollments!inner(course_id)
      `)
      .eq('status', 'active');

    if (courseId) {
      query = query.neq('course_enrollments.course_id', courseId);
    }

    const { data, error } = await query;
    
    if (error) {
      setError(error.message);
    } else {
      setAvailableStudents(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadCourses();
      setLoading(false);
    };
    loadData();
  }, [loadCourses]);

  useEffect(() => {
    if (selectedCourse && view === 'students') {
      loadCourseStudents(selectedCourse.id);
      loadAvailableStudents(selectedCourse.id);
    }
  }, [selectedCourse, view, loadCourseStudents, loadAvailableStudents]);

  const handleCreateCourse = async (data: Partial<Course>) => {
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('courses')
        .insert({
          title: data.title,
          description: data.description,
          duration_hours: data.duration_hours,
          max_students: data.max_students,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status || 'draft',
          teacher_id: user.data.user?.id
        });

      if (error) throw error;

      await loadCourses();
      setShowForm(false);
      setEditingCourse(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEnrollStudent = async (studentId: string) => {
    if (!selectedCourse) return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: selectedCourse.id,
          student_id: studentId,
          status: 'active',
          progress: 0
        });

      if (error) throw error;

      await loadCourseStudents(selectedCourse.id);
      await loadAvailableStudents(selectedCourse.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return { bg: '#f3f4f6', text: '#374151' };
      case 'published': return { bg: '#dbeafe', text: '#1e40af' };
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'completed': return { bg: '#e0e7ff', text: '#4338ca' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CourseForm = () => {
    const [formData, setFormData] = useState({
      title: editingCourse?.title || '',
      description: editingCourse?.description || '',
      duration_hours: editingCourse?.duration_hours || 40,
      max_students: editingCourse?.max_students || 25,
      start_date: editingCourse?.start_date || '',
      end_date: editingCourse?.end_date || '',
      status: editingCourse?.status || 'draft'
    });

    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: '2rem', 
          width: '90%', 
          maxWidth: 600 
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>
            {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Título del curso *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
                placeholder="Introducción a las Matemáticas"
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  minHeight: 100,
                  resize: 'vertical'
                }}
                placeholder="Descripción detallada del curso..."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Duración (horas) *
              </label>
              <input
                type="number"
                value={formData.duration_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) || 0 }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
                min="1"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Máximo estudiantes *
              </label>
              <input
                type="number"
                value={formData.max_students}
                onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 0 }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
                min="1"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Fecha de inicio *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Fecha de fin
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Estado del curso
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 8,
                  fontSize: '0.875rem'
                }}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCourse(null);
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => handleCreateCourse(formData)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: 8,
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {editingCourse ? 'Actualizar' : 'Crear Curso'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (selectedCourse && view === 'students') {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => setSelectedCourse(null)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              background: 'white',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            ← Volver
          </button>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.875rem', fontWeight: 'bold' }}>
              {selectedCourse.title}
            </h1>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Gestión de estudiantes del curso
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Estudiantes inscritos */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Estudiantes Inscritos ({courseStudents.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courseStudents.map(student => (
                <div key={student.id} style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '1rem'
                  }}>
                    {student.name.charAt(0)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>{student.name}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                      {student.email}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Progreso: {student.progress}%
                      </span>
                      <div style={{
                        background: '#e5e7eb',
                        borderRadius: 8,
                        height: 6,
                        width: 100,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: '#3b82f6',
                          height: '100%',
                          width: `${student.progress}%`
                        }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: student.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: student.status === 'active' ? '#166534' : '#dc2626',
                    marginLeft: '1rem'
                  }}>
                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estudiantes disponibles */}
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Estudiantes Disponibles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableStudents.slice(0, 10).map(student => (
                <div key={student.id} style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>{student.name}</h5>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem' }}>{student.email}</p>
                  </div>
                  <button
                    onClick={() => handleEnrollStudent(student.id)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    Inscribir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.875rem', fontWeight: 'bold' }}>
          Gestión de Cursos
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Crea y administra tus cursos y estudiantes
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '0.75rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.75rem',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <button
          onClick={() => {
            setEditingCourse(null);
            setShowForm(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Cargando cursos...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredCourses.map(course => {
            const statusColor = getStatusColor(course.status);
            
            return (
              <div key={course.id} style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '1.5rem',
                transition: 'box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    background: '#dbeafe',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={24} style={{ color: '#1e40af' }} />
                  </div>
                  
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: statusColor.bg,
                    color: statusColor.text
                  }}>
                    {course.status === 'draft' && 'Borrador'}
                    {course.status === 'published' && 'Publicado'}
                    {course.status === 'active' && 'Activo'}
                    {course.status === 'completed' && 'Completado'}
                  </div>
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                  {course.title}
                </h3>
                
                {course.description && (
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#6b7280', 
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {course.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                      {course.duration_hours}h
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                      {course.enrolled_count}/{course.max_students}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: '#6b7280' }} />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                      {new Date(course.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setView('students');
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Users size={16} />
                    Estudiantes
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setShowForm(true);
                    }}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #dc2626',
                      borderRadius: 6,
                      background: 'white',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Form */}
      {showForm && <CourseForm />}
    </div>
  );
}
