'use client';

import React, { useState, useRef } from 'react';
import styles from './SimulacroBuilder.module.css';
import { 
  X, Plus, Trash2, Image as ImageIcon, Upload, Check, AlertCircle 
} from 'lucide-react';
import type { SimulacroQuestion, QuestionOption } from './SimulacroBuilder';

// ============================================================================
// QUESTION EDITOR MODAL
// ============================================================================

interface QuestionEditorModalProps {
  question: SimulacroQuestion;
  onSave: (question: SimulacroQuestion) => void;
  onCancel: () => void;
  onImageUpload: (file: File, type: any) => Promise<string>;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  question: initialQuestion,
  onSave,
  onCancel,
  onImageUpload
}) => {
  const [question, setQuestion] = useState<SimulacroQuestion>(initialQuestion);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const explanationImageInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // MANEJO DE IMÁGENES
  // ============================================================================

  const handleQuestionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      try {
        const url = await onImageUpload(file, 'question');
        setQuestion({ ...question, questionImageUrl: url });
      } catch (error) {
        alert('Error al subir la imagen');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleOptionImageUpload = async (optionId: string, file: File) => {
    setUploadingImage(true);
    try {
      const url = await onImageUpload(file, 'option');
      setQuestion({
        ...question,
        options: question.options.map(opt =>
          opt.id === optionId ? { ...opt, optionImageUrl: url } : opt
        )
      });
    } catch (error) {
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleExplanationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      try {
        const url = await onImageUpload(file, 'explanation');
        setQuestion({ ...question, explanationImageUrl: url });
      } catch (error) {
        alert('Error al subir la imagen');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // ============================================================================
  // MANEJO DE OPCIONES
  // ============================================================================

  const addOption = () => {
    const newOption: QuestionOption = {
      id: `opt_${Date.now()}`,
      optionText: '',
      isCorrect: false
    };
    setQuestion({
      ...question,
      options: [...question.options, newOption]
    });
  };

  const updateOption = (optionId: string, updates: Partial<QuestionOption>) => {
    setQuestion({
      ...question,
      options: question.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    });
  };

  const removeOption = (optionId: string) => {
    if (question.options.length <= 2) {
      alert('Debe haber al menos 2 opciones');
      return;
    }
    setQuestion({
      ...question,
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const setCorrectOption = (optionId: string) => {
    if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
      // Solo una opción correcta
      setQuestion({
        ...question,
        options: question.options.map(opt => ({
          ...opt,
          isCorrect: opt.id === optionId
        }))
      });
    } else if (question.questionType === 'multiple-select') {
      // Múltiples opciones correctas
      setQuestion({
        ...question,
        options: question.options.map(opt =>
          opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        )
      });
    }
  };

  // ============================================================================
  // VALIDACIÓN Y GUARDADO
  // ============================================================================

  const handleSave = () => {
    // Validaciones
    if (!question.questionText.trim()) {
      alert('El enunciado de la pregunta es obligatorio');
      return;
    }

    if (question.questionType !== 'short-answer' && question.questionType !== 'essay') {
      if (question.options.length < 2) {
        alert('Debe haber al menos 2 opciones');
        return;
      }

      const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        alert('Debe seleccionar al menos una respuesta correcta');
        return;
      }

      const allOptionsHaveText = question.options.every(opt => opt.optionText.trim() || opt.optionImageUrl);
      if (!allOptionsHaveText) {
        alert('Todas las opciones deben tener texto o imagen');
        return;
      }
    }

    onSave(question);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={styles.modal}>
      <div className={styles.modalOverlay} onClick={onCancel} />
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            {initialQuestion.id.startsWith('q_') ? 'Nueva Pregunta' : 'Editar Pregunta'}
          </h2>
          <button onClick={onCancel} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Tipo de Pregunta */}
          <div className={styles.formGroup}>
            <label>Tipo de Pregunta</label>
            <select
              value={question.questionType}
              onChange={(e) => setQuestion({ 
                ...question, 
                questionType: e.target.value as any,
                options: e.target.value === 'true-false' 
                  ? [
                      { id: 'opt_true', optionText: 'Verdadero', isCorrect: false },
                      { id: 'opt_false', optionText: 'Falso', isCorrect: false }
                    ]
                  : question.options
              })}
              className={styles.select}
            >
              <option value="multiple-choice">Opción Múltiple (una respuesta)</option>
              <option value="multiple-select">Selección Múltiple (varias respuestas)</option>
              <option value="true-false">Verdadero/Falso</option>
              <option value="short-answer">Respuesta Corta</option>
              <option value="essay">Ensayo/Desarrollo</option>
            </select>
          </div>

          {/* Enunciado de la Pregunta */}
          <div className={styles.formGroup}>
            <label>Enunciado de la Pregunta *</label>
            <textarea
              value={question.questionText}
              onChange={(e) => setQuestion({ ...question, questionText: e.target.value })}
              placeholder="Escribe aquí la pregunta..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          {/* Imagen del Enunciado */}
          <div className={styles.formGroup}>
            <label>
              <ImageIcon size={16} className={styles.icon} />
              Imagen del Enunciado (opcional)
            </label>
            
            {question.questionImageUrl ? (
              <div className={styles.imagePreview}>
                <img src={question.questionImageUrl} alt="Imagen de la pregunta" />
                <button
                  onClick={() => setQuestion({ ...question, questionImageUrl: undefined })}
                  className={styles.removeImageButton}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => questionImageInputRef.current?.click()}
                className={styles.uploadButton}
                type="button"
                disabled={uploadingImage}
              >
                <Upload size={18} />
                <span>{uploadingImage ? 'Subiendo...' : 'Subir Imagen'}</span>
              </button>
            )}
            
            <input
              ref={questionImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleQuestionImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Opciones de Respuesta */}
          {question.questionType !== 'short-answer' && question.questionType !== 'essay' && (
            <div className={styles.formGroup}>
              <div className={styles.optionsHeader}>
                <label>Opciones de Respuesta</label>
                {question.questionType !== 'true-false' && (
                  <button onClick={addOption} className={styles.addOptionButton} type="button">
                    <Plus size={16} />
                    <span>Agregar Opción</span>
                  </button>
                )}
              </div>

              <div className={styles.optionsList}>
                {question.options.map((option, index) => (
                  <OptionEditor
                    key={option.id}
                    option={option}
                    index={index}
                    questionType={question.questionType}
                    onUpdate={(updates) => updateOption(option.id, updates)}
                    onRemove={() => removeOption(option.id)}
                    onSetCorrect={() => setCorrectOption(option.id)}
                    onImageUpload={(file) => handleOptionImageUpload(option.id, file)}
                    uploadingImage={uploadingImage}
                    canRemove={question.questionType !== 'true-false' && question.options.length > 2}
                  />
                ))}
              </div>

              <p className={styles.helpText}>
                {question.questionType === 'multiple-choice' && '💡 Selecciona UNA opción correcta'}
                {question.questionType === 'multiple-select' && '💡 Selecciona todas las opciones correctas'}
                {question.questionType === 'true-false' && '💡 Selecciona la opción correcta'}
              </p>
            </div>
          )}

          {/* Explicación */}
          <div className={styles.formGroup}>
            <label>Explicación de la Respuesta (opcional)</label>
            <textarea
              value={question.explanationText || ''}
              onChange={(e) => setQuestion({ ...question, explanationText: e.target.value })}
              placeholder="Explica por qué esta es la respuesta correcta..."
              className={styles.textarea}
              rows={2}
            />
          </div>

          {/* Imagen de Explicación */}
          <div className={styles.formGroup}>
            <label>
              <ImageIcon size={16} className={styles.icon} />
              Imagen de Explicación (opcional)
            </label>
            
            {question.explanationImageUrl ? (
              <div className={styles.imagePreview}>
                <img src={question.explanationImageUrl} alt="Imagen de explicación" />
                <button
                  onClick={() => setQuestion({ ...question, explanationImageUrl: undefined })}
                  className={styles.removeImageButton}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => explanationImageInputRef.current?.click()}
                className={styles.uploadButton}
                type="button"
                disabled={uploadingImage}
              >
                <Upload size={18} />
                <span>{uploadingImage ? 'Subiendo...' : 'Subir Imagen'}</span>
              </button>
            )}
            
            <input
              ref={explanationImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleExplanationImageUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Configuración Adicional */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Puntos</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) || 1 })}
                min="1"
                max="100"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Dificultad</label>
              <select
                value={question.difficulty}
                onChange={(e) => setQuestion({ ...question, difficulty: e.target.value as any })}
                className={styles.select}
              >
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Tiempo Estimado (seg)</label>
              <input
                type="number"
                value={question.estimatedTimeSeconds || 60}
                onChange={(e) => setQuestion({ ...question, estimatedTimeSeconds: parseInt(e.target.value) || 60 })}
                min="10"
                max="600"
                className={styles.input}
              />
            </div>
          </div>

          {/* Tags */}
          <div className={styles.formGroup}>
            <label>Etiquetas (separadas por coma)</label>
            <input
              type="text"
              value={question.tags.join(', ')}
              onChange={(e) => setQuestion({ 
                ...question, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
              })}
              placeholder="Ej: álgebra, ecuaciones, nivel básico"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            <Check size={18} />
            <span>Guardar Pregunta</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// OPTION EDITOR COMPONENT
// ============================================================================

interface OptionEditorProps {
  option: QuestionOption;
  index: number;
  questionType: string;
  onUpdate: (updates: Partial<QuestionOption>) => void;
  onRemove: () => void;
  onSetCorrect: () => void;
  onImageUpload: (file: File) => void;
  uploadingImage: boolean;
  canRemove: boolean;
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  option,
  index,
  questionType,
  onUpdate,
  onRemove,
  onSetCorrect,
  onImageUpload,
  uploadingImage,
  canRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className={`${styles.optionItem} ${option.isCorrect ? styles.correct : ''}`}>
      <div className={styles.optionHeader}>
        <div className={styles.optionLetter}>{letters[index]}</div>
        
        <div className={styles.correctCheckbox}>
          <input
            type={questionType === 'multiple-select' ? 'checkbox' : 'radio'}
            checked={option.isCorrect}
            onChange={onSetCorrect}
            name="correct-answer"
          />
          <label>Correcta</label>
        </div>

        {canRemove && (
          <button onClick={onRemove} className={styles.removeButton} type="button">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className={styles.optionContent}>
        <input
          type="text"
          value={option.optionText}
          onChange={(e) => onUpdate({ optionText: e.target.value })}
          placeholder={`Opción ${letters[index]}`}
          className={styles.input}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className={styles.imageButton}
          type="button"
          disabled={uploadingImage}
          title="Agregar imagen a la opción"
        >
          <ImageIcon size={16} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {option.optionImageUrl && (
        <div className={styles.optionImagePreview}>
          <img src={option.optionImageUrl} alt={`Opción ${letters[index]}`} />
          <button
            onClick={() => onUpdate({ optionImageUrl: undefined })}
            className={styles.removeImageButton}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {option.isCorrect && (
        <div className={styles.feedbackInput}>
          <input
            type="text"
            value={option.feedbackText || ''}
            onChange={(e) => onUpdate({ feedbackText: e.target.value })}
            placeholder="Feedback específico para esta opción (opcional)"
            className={styles.input}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionEditorModal;
