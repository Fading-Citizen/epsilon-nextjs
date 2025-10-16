'use client';

import React from 'react';
import styles from './SimulacroBuilder.module.css';
import { Plus, Edit, Trash2, Copy, ChevronUp, ChevronDown, FileText, AlertCircle } from 'lucide-react';
import type { SimulacroQuestion } from './SimulacroBuilder';

// ============================================================================
// QUESTIONS TAB COMPONENT
// ============================================================================

interface QuestionsTabProps {
  questions: SimulacroQuestion[];
  onAddQuestion: () => void;
  onEditQuestion: (question: SimulacroQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (question: SimulacroQuestion) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion
}) => {
  if (questions.length === 0) {
    return (
      <div className={styles.questionsTab}>
        <div className={styles.emptyState}>
          <FileText size={64} />
          <h3>No hay preguntas aún</h3>
          <p>Comienza agregando la primera pregunta de tu simulacro</p>
          <button onClick={onAddQuestion} className={styles.addQuestionButton} style={{ marginTop: '1.5rem' }}>
            <Plus size={18} />
            <span>Agregar Primera Pregunta</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.questionsTab}>
      <div className={styles.questionsHeader}>
        <h2>{questions.length} Pregunta{questions.length !== 1 ? 's' : ''}</h2>
        <button onClick={onAddQuestion} className={styles.addQuestionButton}>
          <Plus size={18} />
          <span>Agregar Pregunta</span>
        </button>
      </div>

      <div className={styles.questionsList}>
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            totalQuestions={questions.length}
            onEdit={() => onEditQuestion(question)}
            onDelete={() => onDeleteQuestion(question.id)}
            onDuplicate={() => onDuplicateQuestion(question)}
            onMoveUp={() => onMoveQuestion(index, 'up')}
            onMoveDown={() => onMoveQuestion(index, 'down')}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// QUESTION CARD COMPONENT
// ============================================================================

interface QuestionCardProps {
  question: SimulacroQuestion;
  index: number;
  totalQuestions: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown
}) => {
  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'multiple-choice': 'Opción Múltiple',
      'multiple-select': 'Selección Múltiple',
      'true-false': 'Verdadero/Falso',
      'short-answer': 'Respuesta Corta',
      'essay': 'Ensayo'
    };
    return labels[type] || type;
  };

  const correctOptionsCount = question.options?.filter(opt => opt.isCorrect).length || 0;

  return (
    <div className={styles.questionCard}>
      <div className={styles.questionHeader}>
        <div className={styles.questionNumber}>
          <span>Pregunta {index + 1}</span>
          <span className={`${styles.difficultyBadge} ${styles[question.difficulty]}`}>
            {question.difficulty === 'easy' ? 'Fácil' : question.difficulty === 'medium' ? 'Medio' : 'Difícil'}
          </span>
        </div>

        <div className={styles.questionActions}>
          {index > 0 && (
            <button onClick={onMoveUp} title="Subir">
              <ChevronUp size={16} />
            </button>
          )}
          {index < totalQuestions - 1 && (
            <button onClick={onMoveDown} title="Bajar">
              <ChevronDown size={16} />
            </button>
          )}
          <button onClick={onEdit} title="Editar">
            <Edit size={16} />
          </button>
          <button onClick={onDuplicate} title="Duplicar">
            <Copy size={16} />
          </button>
          <button onClick={onDelete} title="Eliminar" style={{ color: '#ef4444' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={styles.questionText}>
        {question.questionText || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin enunciado</span>}
      </div>

      {question.questionImageUrl && (
        <div className={styles.questionImage}>
          <img src={question.questionImageUrl} alt="Imagen de la pregunta" />
        </div>
      )}

      {question.options && question.options.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {getQuestionTypeLabel(question.questionType)} - {correctOptionsCount} correcta(s)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options.map((opt, i) => (
              <div
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: opt.isCorrect ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${opt.isCorrect ? '#86efac' : '#e2e8f0'}`,
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              >
                <span style={{ fontWeight: 600, color: opt.isCorrect ? '#15803d' : '#64748b' }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                <span style={{ color: '#334155' }}>
                  {opt.optionText || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin texto</span>}
                </span>
                {opt.optionImageUrl && <span style={{ color: '#6969bc' }}>📷</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.questionMeta}>
        <div className={styles.metaItem}>
          <span>💯</span>
          <span>{question.points} punto{question.points !== 1 ? 's' : ''}</span>
        </div>
        <div className={styles.metaItem}>
          <span>⏱️</span>
          <span>{question.estimatedTimeSeconds || 60}s estimado</span>
        </div>
        {question.tags.length > 0 && (
          <div className={styles.metaItem}>
            <span>🏷️</span>
            <span>{question.tags.join(', ')}</span>
          </div>
        )}
      </div>

      {question.explanationText && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '4px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
            EXPLICACIÓN
          </div>
          <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
            {question.explanationText}
          </div>
          {question.explanationImageUrl && (
            <div style={{ marginTop: '0.5rem' }}>
              <img src={question.explanationImageUrl} alt="Explicación" style={{ maxWidth: '200px', borderRadius: '4px' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;
