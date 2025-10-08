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

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

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
  difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Acceso y suscripción
  isSample: boolean; // Disponible para usuarios free
  requiresSubscription: 'free' | 'basic' | 'premium' | 'enterprise';
  
  // Configuración del examen
  timeLimitMinutes: number;
  maxAttempts: number;
  passingScore: number;
  
  // Opciones de comportamiento
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  allowReview: boolean;
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
  
  const [settings, setSettings] = useState<SimulacroSettings>({
    title: '',
    description: '',
    instructions: 'Lee cuidadosamente cada pregunta antes de responder. Tienes tiempo limitado.',
    category: 'general',
    difficultyLevel: 'medium',
    isSample: false,
    requiresSubscription: 'free',
    timeLimitMinutes: 60,
    maxAttempts: 3,
    passingScore: 70,
    shuffleQuestions: false,
    shuffleOptions: true,
    showCorrectAnswers: true,
    showExplanations: true,
    allowReview: true,
    showResultsImmediately: true
  });

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
}> = ({ settings, setSettings, onImageUpload }) => {
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

          <div className={styles.formGroup}>
            <label>Nivel de Dificultad</label>
            <select
              value={settings.difficultyLevel}
              onChange={(e) => setSettings({ ...settings, difficultyLevel: e.target.value as any })}
              className={styles.select}
            >
              <option value="easy">Fácil</option>
              <option value="medium">Intermedio</option>
              <option value="hard">Difícil</option>
              <option value="expert">Experto</option>
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
              checked={settings.showResultsImmediately}
              onChange={(e) => setSettings({ ...settings, showResultsImmediately: e.target.checked })}
            />
            <span>Mostrar resultados inmediatamente</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SimulacroBuilder;
