'use client';

import React, { useState, useRef } from 'react';
import styles from './SimulacroBuilder.module.css';
import { 
  ArrowLeft, Save, Plus, Trash2, Edit, Copy, Eye, Settings, 
  Clock, Target, Users, FileText, Image as ImageIcon, Upload,
  X, Check, AlertCircle, ChevronDown, ChevronUp, Move
} from 'lucide-react';
import { QuestionsTab } from './QuestionsTab';
import { QuestionEditorModal } from './QuestionEditorModal';
import { PreviewTab } from './PreviewTab';
import ThresholdsEditor, { PerformanceThreshold } from './ThresholdsEditor';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface Servicio {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  color: string;
  activo: boolean;
  createdAt: Date;
}

export interface QuestionOption {
  id: string;
  optionText: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  feedbackText?: string;
}

export interface SimulacroQuestion {
  id: string;
  questionText: string;
  questionImageUrl?: string; // ⭐ Imagen del enunciado
  questionType: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay';
  options: QuestionOption[];
  explanationText?: string;
  explanationImageUrl?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  estimatedTimeSeconds?: number;
  orderIndex: number;
}

export interface SimulacroSettings {
  title: string;
  description: string;
  instructions: string;
  courseId?: string;
  category: string;
  servicio: string; // Servicio/Producto al que pertenece
  
  // Acceso y suscripción
  isSample: boolean; // Disponible para usuarios free
  requiresSubscription: 'free' | 'basic' | 'premium' | 'enterprise';
  
  // Prerequisitos (dependencias)
  prerequisiteSimulacroId?: string; // ID del simulacro que debe completarse primero
  minimumScoreRequired?: number; // Puntaje mínimo requerido en el prerequisito (0-100)
  
  // Configuración del examen
  timeLimitMinutes: number;
  maxAttempts: number;
  passingScore: number;
  
  // Selección aleatoria de preguntas
  useRandomQuestions: boolean; // Si es true, selecciona al azar del banco
  randomQuestionCount?: number; // Cantidad de preguntas a seleccionar aleatoriamente
  
  // Opciones de comportamiento
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  allowReview: boolean;
  allowSkip: boolean;
  allowGoBack: boolean;
  requireAllAnswers: boolean;
  performanceThresholds: PerformanceThreshold[];
  showResultsImmediately: boolean;
  
  // Fechas de disponibilidad
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Imagen de portada
  thumbnailUrl?: string;
}

interface SimulacroBuilderProps {
  simulacroId?: string;
  onSave: (simulacro: any) => void;
  onCancel: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SimulacroBuilder: React.FC<SimulacroBuilderProps> = ({ 
  simulacroId, 
  onSave, 
  onCancel 
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'preview'>('settings');
  const [editingQuestion, setEditingQuestion] = useState<SimulacroQuestion | null>(null);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  
  // Lista de servicios disponibles - en producción vendría de la BD
  const [serviciosDisponibles, setServiciosDisponibles] = useState<Servicio[]>([
    { id: '1', nombre: 'ICFES', icono: '📚', descripcion: 'Preparación para examen de estado', color: '#3b82f6', activo: true, createdAt: new Date() },
    { id: '2', nombre: 'Saber Pro', icono: '🎓', descripcion: 'Pruebas universitarias', color: '#10b981', activo: true, createdAt: new Date() },
    { id: '3', nombre: 'Admisiones', icono: '🏛️', descripcion: 'Ingreso a universidades', color: '#f59e0b', activo: true, createdAt: new Date() },
    { id: '4', nombre: 'Corporativo', icono: '💼', descripcion: 'Capacitación empresarial', color: '#8b5cf6', activo: true, createdAt: new Date() },
    { id: '5', nombre: 'Cursos Especializados', icono: '🔬', descripcion: 'Formación técnica y profesional', color: '#ec4899', activo: true, createdAt: new Date() }
  ]);
  
  const [newService, setNewService] = useState({
    nombre: '',
    icono: '📦',
    descripcion: '',
    color: '#6366f1'
  });
  
  const [settings, setSettings] = useState<SimulacroSettings>({
    title: '',
    description: '',
    instructions: 'Lee cuidadosamente cada pregunta antes de responder. Tienes tiempo limitado.',
    category: 'general',
    servicio: 'ICFES',
    isSample: false,
    requiresSubscription: 'free',
    timeLimitMinutes: 60,
    maxAttempts: 3,
    passingScore: 70,
    useRandomQuestions: false,
    randomQuestionCount: undefined,
    shuffleQuestions: false,
    shuffleOptions: true,
    showCorrectAnswers: true,
    showExplanations: true,
    allowReview: true,
    allowSkip: true,
    allowGoBack: true,
    requireAllAnswers: false,
    performanceThresholds: [
      {
        id: 'excellent',
        name: 'Superior',
        minPercentage: 90,
        maxPercentage: 100,
        color: '#10b981',
        messageHtml: '<h3 style="color: #10b981;">🏆 ¡Rendimiento Superior!</h3><p>Tu desempeño ha sido excepcional. Estás completamente preparado para el examen ICFES.</p>'
      },
      {
        id: 'high',
        name: 'Alto',
        minPercentage: 75,
        maxPercentage: 89,
        color: '#3b82f6',
        messageHtml: '<h3 style="color: #3b82f6;">⭐ ¡Buen Rendimiento!</h3><p>Tienes un buen nivel de preparación. Sigue practicando para alcanzar la excelencia.</p>'
      },
      {
        id: 'medium',
        name: 'Medio',
        minPercentage: 50,
        maxPercentage: 74,
        color: '#f59e0b',
        messageHtml: '<h3 style="color: #f59e0b;">📚 Rendimiento Medio</h3><p>Necesitas reforzar algunos temas. Te recomendamos repasar y volver a practicar.</p>'
      },
      {
        id: 'low',
        name: 'Bajo',
        minPercentage: 0,
        maxPercentage: 49,
        color: '#ef4444',
        messageHtml: '<h3 style="color: #ef4444;">📖 Necesitas Mejorar</h3><p>Es importante que dediques más tiempo al estudio. Revisa los temas fundamentales y practica nuevamente.</p>'
      }
    ],
    showResultsImmediately: true
  });

  // Estado de preguntas del banco
  const [questions, setQuestions] = useState<SimulacroQuestion[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ============================================================================
  // MANEJO DE IMÁGENES
  // ============================================================================

  const handleImageUpload = async (file: File, type: 'question' | 'option' | 'explanation' | 'thumbnail'): Promise<string> => {
    setUploadingImage(true);
    
    try {
      // TODO: Implementar upload a Supabase Storage
      // Por ahora, retornamos una URL de ejemplo
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulación de upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En producción, esto sería:
      // const { data, error } = await supabase.storage
      //   .from('simulacros')
      //   .upload(`${type}/${Date.now()}_${file.name}`, file);
      
      const mockUrl = URL.createObjectURL(file);
      return mockUrl;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // ============================================================================
  // MANEJO DE SERVICIOS
  // ============================================================================

  const handleCreateService = () => {
    if (!newService.nombre.trim()) {
      alert('El nombre del servicio es obligatorio');
      return;
    }

    const nuevoServicio: Servicio = {
      id: `srv_${Date.now()}`,
      nombre: newService.nombre,
      icono: newService.icono,
      descripcion: newService.descripcion,
      color: newService.color,
      activo: true,
      createdAt: new Date()
    };

    setServiciosDisponibles([...serviciosDisponibles, nuevoServicio]);
    setSettings({ ...settings, servicio: nuevoServicio.nombre });
    setShowNewServiceModal(false);
    
    // Resetear formulario
    setNewService({
      nombre: '',
      icono: '📦',
      descripcion: '',
      color: '#6366f1'
    });

    // TODO: En producción, guardar en la base de datos
    console.log('Nuevo servicio creado:', nuevoServicio);
  };

  const iconosDisponibles = ['📚', '🎓', '🏛️', '💼', '🔬', '📦', '🎯', '🚀', '💡', '🏆', '🌟', '⚡', '🔥', '💻', '🎨', '🏅'];

  // ============================================================================
  // MANEJO DE PREGUNTAS
  // ============================================================================

  const addQuestion = () => {
    const newQuestion: SimulacroQuestion = {
      id: `q_${Date.now()}`,
      questionText: '',
      questionType: 'multiple-choice',
      options: [
        { id: `opt_${Date.now()}_0`, optionText: '', isCorrect: false },
        { id: `opt_${Date.now()}_1`, optionText: '', isCorrect: false },
        { id: `opt_${Date.now()}_2`, optionText: '', isCorrect: false },
        { id: `opt_${Date.now()}_3`, optionText: '', isCorrect: false }
      ],
      points: 1,
      difficulty: 'medium',
      tags: [],
      orderIndex: questions.length
    };
    
    setEditingQuestion(newQuestion);
  };

  const saveQuestion = (question: SimulacroQuestion) => {
    if (questions.find(q => q.id === question.id)) {
      setQuestions(questions.map(q => q.id === question.id ? question : q));
    } else {
      setQuestions([...questions, question]);
    }
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId: string) => {
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const duplicateQuestion = (question: SimulacroQuestion) => {
    const newQuestion = {
      ...question,
      id: `q_${Date.now()}`,
      orderIndex: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < questions.length) {
      [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
      newQuestions.forEach((q, i) => q.orderIndex = i);
      setQuestions(newQuestions);
    }
  };

  // ============================================================================
  // CÁLCULOS Y ESTADÍSTICAS
  // ============================================================================

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const totalQuestions = questions.length;
  const estimatedDuration = questions.reduce((sum, q) => sum + (q.estimatedTimeSeconds || 60), 0) / 60;

  const getDifficultyDistribution = () => {
    const dist = { easy: 0, medium: 0, hard: 0 };
    questions.forEach(q => dist[q.difficulty]++);
    return dist;
  };

  // ============================================================================
  // GUARDAR SIMULACRO
  // ============================================================================

  const handleSave = async () => {
    if (!settings.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (questions.length === 0) {
      alert('Debes agregar al menos una pregunta');
      return;
    }

    const simulacro = {
      settings,
      questions,
      totalPoints,
      totalQuestions,
      estimatedDurationMinutes: Math.ceil(estimatedDuration)
    };

    onSave(simulacro);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onCancel} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        
        <h1 className={styles.title}>
          {simulacroId ? 'Editar Simulacro' : 'Crear Nuevo Simulacro'}
        </h1>

        <div className={styles.headerActions}>
          <button className={styles.previewButton}>
            <Eye size={18} />
            <span>Vista Previa</span>
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            <Save size={18} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'questions' ? styles.active : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          <FileText size={18} />
          <span>Preguntas ({questions.length})</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Eye size={18} />
          <span>Vista Previa</span>
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'settings' && (
          <SettingsTab 
            settings={settings} 
            setSettings={setSettings}
            onImageUpload={handleImageUpload}
            serviciosDisponibles={serviciosDisponibles}
            onCreateNewService={() => setShowNewServiceModal(true)}
            questions={questions}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            questions={questions}
            onAddQuestion={addQuestion}
            onEditQuestion={setEditingQuestion}
            onDeleteQuestion={deleteQuestion}
            onDuplicateQuestion={duplicateQuestion}
            onMoveQuestion={moveQuestion}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewTab
            settings={settings}
            questions={questions}
            totalPoints={totalPoints}
            estimatedDuration={estimatedDuration}
          />
        )}
      </div>

      {/* Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditorModal
          question={editingQuestion}
          onSave={saveQuestion}
          onCancel={() => setEditingQuestion(null)}
          onImageUpload={handleImageUpload}
        />
      )}

      {/* Modal para Crear Nuevo Servicio */}
      {showNewServiceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>Crear Nuevo Servicio</h2>
              <button
                onClick={() => setShowNewServiceModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={newService.nombre}
                  onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
                  placeholder="Ej: Preparación ICFES"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  Descripción
                </label>
                <textarea
                  value={newService.descripcion}
                  onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
                  placeholder="Describe brevemente este servicio..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Icono
                  </label>
                  <select
                    value={newService.icono}
                    onChange={(e) => setNewService({ ...newService, icono: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1.25rem'
                    }}
                  >
                    {iconosDisponibles.map(icono => (
                      <option key={icono} value={icono}>{icono}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Color
                  </label>
                  <input
                    type="color"
                    value={newService.color}
                    onChange={(e) => setNewService({ ...newService, color: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '0.5rem',
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '2rem' }}>{newService.icono}</span>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>{newService.nombre || 'Nombre del servicio'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{newService.descripcion || 'Sin descripción'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowNewServiceModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateService}
                disabled={!newService.nombre.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: newService.nombre.trim() ? '#6366f1' : '#d1d5db',
                  color: 'white',
                  fontWeight: '600',
                  cursor: newService.nombre.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Crear Servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Sidebar */}
      <div className={styles.statsSidebar}>
        <div className={styles.statCard}>
          <FileText size={24} />
          <div className={styles.statValue}>{totalQuestions}</div>
          <div className={styles.statLabel}>Preguntas</div>
        </div>
        <div className={styles.statCard}>
          <Target size={24} />
          <div className={styles.statValue}>{totalPoints}</div>
          <div className={styles.statLabel}>Puntos Totales</div>
        </div>
        <div className={styles.statCard}>
          <Clock size={24} />
          <div className={styles.statValue}>{Math.ceil(estimatedDuration)}</div>
          <div className={styles.statLabel}>Minutos Est.</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SETTINGS TAB COMPONENT
// ============================================================================

const SettingsTab: React.FC<{
  settings: SimulacroSettings;
  setSettings: (settings: SimulacroSettings) => void;
  onImageUpload: (file: File, type: any) => Promise<string>;
  serviciosDisponibles: Servicio[];
  onCreateNewService: () => void;
  questions: SimulacroQuestion[];
}> = ({ settings, setSettings, onImageUpload, serviciosDisponibles, onCreateNewService, questions }) => {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await onImageUpload(file, 'thumbnail');
        setSettings({ ...settings, thumbnailUrl: url });
      } catch (error) {
        alert('Error al subir la imagen');
      }
    }
  };

  return (
    <div className={styles.settingsTab}>
      <div className={styles.settingsSection}>
        <h3>Información Básica</h3>
        
        <div className={styles.formGroup}>
          <label>Título del Simulacro *</label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings({ ...settings, title: e.target.value })}
            placeholder="Ej: Simulacro de Matemáticas - Nivel Básico"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Descripción</label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            placeholder="Describe de qué trata este simulacro..."
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Instrucciones</label>
          <textarea
            value={settings.instructions}
            onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
            placeholder="Instrucciones para los estudiantes..."
            className={styles.textarea}
            rows={2}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Servicio/Producto</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <select
                value={settings.servicio}
                onChange={(e) => {
                  if (e.target.value === '__crear_nuevo__') {
                    onCreateNewService();
                  } else {
                    setSettings({ ...settings, servicio: e.target.value });
                  }
                }}
                className={styles.select}
                style={{ flex: 1 }}
              >
                {serviciosDisponibles
                  .filter((s: Servicio) => s.activo)
                  .map((servicio: Servicio) => (
                    <option key={servicio.id} value={servicio.nombre}>
                      {servicio.icono} {servicio.nombre}
                    </option>
                  ))
                }
                <option value="__crear_nuevo__" style={{ borderTop: '1px solid #ccc', marginTop: '4px' }}>
                  ➕ Crear Nuevo Servicio...
                </option>
              </select>
              <button
                type="button"
                onClick={() => onCreateNewService()}
                className={styles.secondaryButton}
                style={{ 
                  padding: '0.5rem 1rem',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                + Nuevo
              </button>
            </div>
            {serviciosDisponibles.find((s: Servicio) => s.nombre === settings.servicio) && (
              <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                {serviciosDisponibles.find((s: Servicio) => s.nombre === settings.servicio)?.descripcion}
              </small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Categoría</label>
            <select
              value={settings.category}
              onChange={(e) => setSettings({ ...settings, category: e.target.value })}
              className={styles.select}
            >
              <option value="matematicas">Matemáticas</option>
              <option value="fisica">Física</option>
              <option value="quimica">Química</option>
              <option value="programacion">Programación</option>
              <option value="idiomas">Idiomas</option>
              <option value="historia">Historia</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Imagen de Portada</label>
          <div className={styles.thumbnailUpload}>
            {settings.thumbnailUrl ? (
              <div className={styles.thumbnailPreview}>
                <img src={settings.thumbnailUrl} alt="Portada" />
                <button
                  onClick={() => setSettings({ ...settings, thumbnailUrl: undefined })}
                  className={styles.removeThumbnail}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                className={styles.uploadButton}
              >
                <Upload size={20} />
                <span>Subir Imagen</span>
              </button>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h3>Control de Acceso</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.isSample}
              onChange={(e) => setSettings({ ...settings, isSample: e.target.checked })}
            />
            <span>Simulacro de muestra (disponible para usuarios gratuitos)</span>
          </label>
          <p className={styles.helpText}>
            Los simulacros de muestra son visibles para todos los usuarios, incluso sin suscripción
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>Nivel de Suscripción Requerido</label>
          <select
            value={settings.requiresSubscription}
            onChange={(e) => setSettings({ ...settings, requiresSubscription: e.target.value as any })}
            className={styles.select}
            disabled={settings.isSample}
          >
            <option value="free">Gratis</option>
            <option value="basic">Básico</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h3>Prerequisitos y Dependencias</h3>
        
        <div className={styles.formGroup}>
          <label>Simulacro Prerequisito</label>
          <select
            value={settings.prerequisiteSimulacroId || ''}
            onChange={(e) => setSettings({ 
              ...settings, 
              prerequisiteSimulacroId: e.target.value || undefined,
              minimumScoreRequired: e.target.value ? (settings.minimumScoreRequired || 70) : undefined
            })}
            className={styles.select}
          >
            <option value="">Ninguno (sin prerequisitos)</option>
            <option value="sim-1">Simulacro ICFES - Matemáticas Básico</option>
            <option value="sim-2">Simulacro ICFES - Lectura Crítica</option>
            <option value="sim-3">Simulacro Saber Pro - Razonamiento Cuantitativo</option>
            {/* En producción, esto se llenará con simulacros reales de la BD */}
          </select>
          <p className={styles.helpText}>
            El estudiante debe completar este simulacro primero antes de acceder al actual
          </p>
        </div>

        {settings.prerequisiteSimulacroId && (
          <div className={styles.formGroup}>
            <label>Puntaje Mínimo Requerido (%)</label>
            <input
              type="number"
              value={settings.minimumScoreRequired || 70}
              onChange={(e) => setSettings({ ...settings, minimumScoreRequired: parseInt(e.target.value) || 70 })}
              min="0"
              max="100"
              className={styles.input}
            />
            <p className={styles.helpText}>
              El estudiante debe obtener al menos este puntaje en el simulacro prerequisito
            </p>
          </div>
        )}
      </div>

      <div className={styles.settingsSection}>
        <h3>Configuración del Examen</h3>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Tiempo Límite (minutos)</label>
            <input
              type="number"
              value={settings.timeLimitMinutes}
              onChange={(e) => setSettings({ ...settings, timeLimitMinutes: parseInt(e.target.value) || 0 })}
              min="0"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Intentos Permitidos</label>
            <input
              type="number"
              value={settings.maxAttempts}
              onChange={(e) => setSettings({ ...settings, maxAttempts: parseInt(e.target.value) || 1 })}
              min="1"
              max="10"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Puntaje Mínimo (%)</label>
            <input
              type="number"
              value={settings.passingScore}
              onChange={(e) => setSettings({ ...settings, passingScore: parseInt(e.target.value) || 70 })}
              min="0"
              max="100"
              className={styles.input}
            />
          </div>
        </div>

        {/* Selección aleatoria de preguntas */}
        <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.useRandomQuestions}
              onChange={(e) => setSettings({ 
                ...settings, 
                useRandomQuestions: e.target.checked,
                randomQuestionCount: e.target.checked ? (settings.randomQuestionCount || Math.min(30, questions.length)) : undefined
              })}
            />
            <span>Seleccionar preguntas al azar del banco total</span>
          </label>
          <p className={styles.helpText}>
            Al activar esta opción, cada vez que un estudiante inicie el simulacro se seleccionarán preguntas aleatorias del banco total
          </p>
        </div>

        {settings.useRandomQuestions && (
          <div className={styles.formGroup}>
            <label>
              Cantidad de preguntas a seleccionar
              <span style={{ 
                marginLeft: '0.5rem', 
                fontSize: '0.875rem', 
                color: '#6b7280',
                fontWeight: 'normal'
              }}>
                (Banco total: {questions.length} preguntas)
              </span>
            </label>
            <input
              type="number"
              value={settings.randomQuestionCount || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setSettings({ 
                  ...settings, 
                  randomQuestionCount: Math.min(value, questions.length)
                });
              }}
              min="1"
              max={questions.length}
              className={styles.input}
              placeholder={`Máximo: ${questions.length}`}
            />
            <p className={styles.helpText}>
              {settings.randomQuestionCount 
                ? `Se seleccionarán ${settings.randomQuestionCount} preguntas aleatorias de las ${questions.length} disponibles en el banco`
                : 'Especifica cuántas preguntas se deben seleccionar aleatoriamente'}
            </p>
          </div>
        )}
      </div>

      <div className={styles.settingsSection}>
        <h3>Opciones de Comportamiento</h3>
        
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.shuffleQuestions}
              onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
            />
            <span>Mezclar orden de preguntas</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.shuffleOptions}
              onChange={(e) => setSettings({ ...settings, shuffleOptions: e.target.checked })}
            />
            <span>Mezclar opciones de respuesta</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.showCorrectAnswers}
              onChange={(e) => setSettings({ ...settings, showCorrectAnswers: e.target.checked })}
            />
            <span>Mostrar respuestas correctas al finalizar</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.showExplanations}
              onChange={(e) => setSettings({ ...settings, showExplanations: e.target.checked })}
            />
            <span>Mostrar explicaciones</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.allowReview}
              onChange={(e) => setSettings({ ...settings, allowReview: e.target.checked })}
            />
            <span>Permitir revisar respuestas antes de enviar</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.allowSkip}
              onChange={(e) => setSettings({ ...settings, allowSkip: e.target.checked })}
            />
            <span>Permitir saltar preguntas sin responder</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.allowGoBack}
              onChange={(e) => setSettings({ ...settings, allowGoBack: e.target.checked })}
            />
            <span>Permitir retroceder a pregunta anterior</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.requireAllAnswers}
              onChange={(e) => setSettings({ ...settings, requireAllAnswers: e.target.checked })}
            />
            <span>Requerir todas las respuestas antes de finalizar</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={settings.showResultsImmediately}
              onChange={(e) => setSettings({ ...settings, showResultsImmediately: e.target.checked })}
            />
            <span>Mostrar resultados inmediatamente</span>
          </label>
        </div>
      </div>

      <ThresholdsEditor
        thresholds={settings.performanceThresholds}
        onChange={(thresholds) => setSettings({ ...settings, performanceThresholds: thresholds })}
      />
    </div>
  );
};

export default SimulacroBuilder;
