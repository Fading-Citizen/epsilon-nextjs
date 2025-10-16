// Clean QuizBuilder (CSS Modules)
'use client';
import React, { useState } from 'react';
import styles from './QuizBuilder.module.css';
import { ArrowLeft, Save, Plus, Trash2, Edit, Copy, Eye, Settings, Clock, Target, Users, FileText } from 'lucide-react';
import ThresholdsEditor, { PerformanceThreshold } from './ThresholdsEditor';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface QuizSettings {
  title: string;
  description: string;
  course: string;
  timeLimit: number;
  maxAttempts: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  allowSkip: boolean;
  allowGoBack: boolean;
  requireAllAnswers: boolean;
  performanceThresholds: PerformanceThreshold[];
  publishImmediately: boolean;
  dueDate?: Date;
  availableFrom?: Date;
  availableUntil?: Date;
}

interface Evaluation {
  id?: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'simulacro';
  course: string;
  status: 'draft' | 'active' | 'finished' | 'archived';
  timeLimit: number;
  questions: number;
  maxAttempts: number;
  passingScore: number;
  createdDate: Date;
  dueDate?: Date;
  publishDate?: Date;
  totalResponses: number;
  averageScore: number;
  passRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizBuilderProps { evaluation?: Evaluation; onSave: (quiz: any) => void; onCancel: () => void; }

const seed: QuizQuestion[] = [
  {
    id: '1',
    type: 'multiple-choice',
    question: '¿Cuál es la derivada de x²?',
    options: ['2x', 'x', '2', '2x²'],
    correctAnswer: 0,
    points: 2,
    difficulty: 'easy',
    tags: ['derivadas'],
    explanation: 'La derivada de x² es 2x.'
  }
];

const courses = ['Cálculo Diferencial', 'Programación Python'];

const QuizBuilder: React.FC<QuizBuilderProps> = ({ evaluation, onSave, onCancel }) => {
  const [tab, setTab] = useState<'questions' | 'settings' | 'preview'>('questions');
  const [editing, setEditing] = useState<QuizQuestion | null>(null);
  const [settings, setSettings] = useState<QuizSettings>({
    title: evaluation?.title || '',
    description: evaluation?.description || '',
    course: evaluation?.course || '',
    timeLimit: 60,
    maxAttempts: 1,
    passingScore: 70,
    shuffleQuestions: false,
    shuffleOptions: true,
    showCorrectAnswers: true,
    allowReview: true,
    allowSkip: true,
    allowGoBack: true,
    requireAllAnswers: false,
    performanceThresholds: [
      {
        id: 'excellent',
        name: 'Excelente',
        minPercentage: 90,
        maxPercentage: 100,
        color: '#10b981',
        messageHtml: '<h3 style="color: #10b981;">¡Excelente Trabajo!</h3><p>Has demostrado un dominio sobresaliente del tema.</p>'
      },
      {
        id: 'good',
        name: 'Bueno',
        minPercentage: 70,
        maxPercentage: 89,
        color: '#3b82f6',
        messageHtml: '<h3 style="color: #3b82f6;">¡Buen Trabajo!</h3><p>Tienes un buen entendimiento del tema.</p>'
      },
      {
        id: 'needs-improvement',
        name: 'Necesita Mejorar',
        minPercentage: 0,
        maxPercentage: 69,
        color: '#ef4444',
        messageHtml: '<h3 style="color: #ef4444;">Necesitas Mejorar</h3><p>Te recomendamos repasar los temas y volver a intentarlo.</p>'
      }
    ],
    publishImmediately: false,
    availableFrom: new Date()
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>(seed);

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const avg = () => {
    if (!questions.length) return 'medium';
    const map: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
    const val = questions.reduce((s, q) => s + map[q.difficulty], 0) / questions.length;
    return val <= 1.5 ? 'easy' : val <= 2.5 ? 'medium' : 'hard';
  };

  const newQuestion = (t: QuizQuestion['type']) =>
    setEditing({
      id: Date.now().toString(),
      type: t,
      question: '',
      options: t === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: t === 'true-false' ? 1 : t === 'multiple-choice' ? 0 : '',
      points: 1,
      difficulty: 'medium',
      tags: []
    });

  const save = (q: QuizQuestion) => {
    setQuestions(prev =>
      prev.find(x => x.id === q.id) ? prev.map(x => (x.id === q.id ? q : x)) : [...prev, q]
    );
    setEditing(null);
  };
  const remove = (id: string) => setQuestions(p => p.filter(q => q.id !== id));
  const duplicate = (q: QuizQuestion) =>
    setQuestions(p => [...p, { ...q, id: Date.now().toString(), question: q.question + ' (Copia)' }]);
  const move = (id: string, d: 'up' | 'down') => {
    const i = questions.findIndex(q => q.id === id);
    if (i < 0) return;
    const arr = [...questions];
    if (d === 'up' && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    if (d === 'down' && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
    setQuestions(arr);
  };
  const diffColor = (d: QuizQuestion['difficulty']) => ({ easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }[d]);
  const finish = () =>
    onSave({
      ...settings,
      questions,
      totalQuestions: questions.length,
      totalPoints,
      createdDate: new Date(),
      status: settings.publishImmediately ? 'active' : 'draft'
    });

  const Editor = ({ q }: { q: QuizQuestion }) => {
    const set = (p: Partial<QuizQuestion>) => setEditing({ ...q, ...p });
    return (
      <div className={styles.questionEditor}>
        <div className={styles.editorHeader}>
          <h3>{questions.find(x => x.id === q.id) ? 'Editar' : 'Nueva'} Pregunta</h3>
            <div className={styles.editorActions}>
              <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => setEditing(null)}>Cancelar</button>
              <button className={`${styles.actionBtn} ${styles.primary}`} onClick={() => save(q)}>Guardar</button>
            </div>
        </div>
        <div className={styles.editorForm}>
          <div className={styles.formGroup}>
            <label>Tipo</label>
            <select
              value={q.type}
              onChange={e =>
                set({
                  type: e.target.value as any,
                  options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined,
                  correctAnswer:
                    e.target.value === 'true-false'
                      ? 1
                      : e.target.value === 'multiple-choice'
                      ? 0
                      : ''
                })
              }
            >
              <option value='multiple-choice'>Opción múltiple</option>
              <option value='true-false'>V/F</option>
              <option value='short-answer'>Corta</option>
              <option value='essay'>Ensayo</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Pregunta *</label>
            <textarea rows={3} value={q.question} onChange={e => set({ question: e.target.value })} />
          </div>
          {q.type === 'multiple-choice' && (
            <div className={styles.formGroup}>
              <label>Opciones</label>
              {q.options?.map((opt, i) => (
                <div key={i} className={styles.optionInput}>
                  <input
                    type='radio'
                    name='c'
                    checked={q.correctAnswer === i}
                    onChange={() => set({ correctAnswer: i })}
                  />
                  <input
                    value={opt}
                    onChange={e => {
                      const o = [...(q.options || [])];
                      o[i] = e.target.value;
                      set({ options: o });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {q.type === 'true-false' && (
            <div className={styles.formGroup}>
              <label>Respuesta</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type='radio'
                    name='tf'
                    checked={q.correctAnswer === 1}
                    onChange={() => set({ correctAnswer: 1 })}
                  />{' '}
                  Verdadero
                </label>
                <label className={styles.radioOption}>
                  <input
                    type='radio'
                    name='tf'
                    checked={q.correctAnswer === 0}
                    onChange={() => set({ correctAnswer: 0 })}
                  />{' '}
                  Falso
                </label>
              </div>
            </div>
          )}
          {(q.type === 'short-answer' || q.type === 'essay') && (
            <div className={styles.formGroup}>
              <label>Respuesta</label>
              <textarea
                rows={q.type === 'essay' ? 4 : 2}
                value={q.correctAnswer as string}
                onChange={e => set({ correctAnswer: e.target.value })}
              />
            </div>
          )}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Puntos</label>
              <input
                type='number'
                value={q.points}
                onChange={e => set({ points: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Dificultad</label>
              <select
                value={q.difficulty}
                onChange={e => set({ difficulty: e.target.value as any })}
              >
                <option value='easy'>Fácil</option>
                <option value='medium'>Medio</option>
                <option value='hard'>Difícil</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Tags</label>
              <input
                value={q.tags.join(', ')}
                onChange={e =>
                  set({
                    tags: e.target.value
                      .split(',')
                      .map(t => t.trim())
                      .filter(Boolean)
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.quizBuilder}>
      <div className={styles.builderHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onCancel}>
            <ArrowLeft size={18} /> Volver
          </button>
          <div className={styles.headerTitle}>
            <h1>{evaluation ? 'Editar Evaluación' : 'Crear Nueva Evaluación'}</h1>
            <p>
              {questions.length} preguntas • {totalPoints} puntos • Dificultad: {avg()}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={() => setTab('preview')}>
            <Eye size={18} /> Vista previa
          </button>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={onCancel}>
            Cancelar
          </button>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={finish}>
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>

      <div className={styles.builderTabs}>
        <button className={`${styles.tab} ${tab === 'questions' ? styles.active : ''}`} onClick={() => setTab('questions')}>
          <FileText size={14} /> Preguntas ({questions.length})
        </button>
        <button className={`${styles.tab} ${tab === 'settings' ? styles.active : ''}`} onClick={() => setTab('settings')}>
          <Settings size={14} /> Configuración
        </button>
        <button className={`${styles.tab} ${tab === 'preview' ? styles.active : ''}`} onClick={() => setTab('preview')}>
          <Eye size={14} /> Vista previa
        </button>
      </div>

      <div className={styles.builderContent}>
        {tab === 'questions' && (
          editing ? (
            <Editor q={editing} />
          ) : (
            <div>
              <div className={styles.questionsHeader}>
                <div className={styles.questionsStats}>
                  <div className={styles.statItem}>
                    <FileText size={14} /> <span>{questions.length}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Target size={14} /> <span>{totalPoints} pts</span>
                  </div>
                  <div className={styles.statItem}>
                    <Clock size={14} /> <span>~{Math.ceil(questions.length * 2)} min</span>
                  </div>
                </div>
                <div className={styles.addQuestionButtons}>
                  <button className={styles.addBtn} onClick={() => newQuestion('multiple-choice')}>
                    <Plus size={14} /> Opción múltiple
                  </button>
                  <button className={styles.addBtn} onClick={() => newQuestion('true-false')}>
                    <Plus size={14} /> V/F
                  </button>
                  <button className={styles.addBtn} onClick={() => newQuestion('short-answer')}>
                    <Plus size={14} /> Corta
                  </button>
                  <button className={styles.addBtn} onClick={() => newQuestion('essay')}>
                    <Plus size={14} /> Ensayo
                  </button>
                </div>
              </div>
              <div className={styles.questionsList}>
                {questions.map((q, i) => (
                  <div key={q.id} className={styles.questionItem}>
                    <div className={styles.questionNumber}>{i + 1}</div>
                    <div className={styles.questionContent}>
                      <div className={styles.questionHeader}>
                        <div className={styles.questionType}>
                          <span>
                            {q.type === 'multiple-choice'
                              ? '🔘'
                              : q.type === 'true-false'
                              ? '✓✗'
                              : q.type === 'short-answer'
                              ? '📝'
                              : '📄'}
                          </span>
                          <span>{q.type}</span>
                        </div>
                        <div className={styles.questionMeta}>
                          <span className={styles.difficultyBadge} style={{ color: diffColor(q.difficulty) }}>
                            {q.difficulty}
                          </span>
                          <span className={styles.pointsBadge}>{q.points} pts</span>
                        </div>
                      </div>
                      <div className={styles.questionText}>
                        {q.question || <em style={{ opacity: 0.5 }}>Sin enunciado</em>}
                      </div>
                      {q.tags.length > 0 && (
                        <div className={styles.questionTags}>
                          {q.tags.map(t => (
                            <span key={t} className={styles.tag}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={styles.questionActions}>
                      <button onClick={() => setEditing(q)}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => duplicate(q)}>
                        <Copy size={14} />
                      </button>
                      <button onClick={() => move(q.id, 'up')} disabled={i === 0}>
                        ↑
                      </button>
                      <button onClick={() => move(q.id, 'down')} disabled={i === questions.length - 1}>
                        ↓
                      </button>
                      <button onClick={() => remove(q.id)} className='danger'>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
        {tab === 'settings' && (
          <div className={styles.settingsSections}>
            <div className={styles.settingsSection}>
              <h3>Información General</h3>
              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  value={settings.title}
                  onChange={e => setSettings({ ...settings, title: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={e => setSettings({ ...settings, description: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Curso *</label>
                <select
                  value={settings.course}
                  onChange={e => setSettings({ ...settings, course: e.target.value })}
                >
                  <option value=''>Seleccione curso</option>
                  {courses.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.settingsSection}>
              <h3>Tiempo & Intentos</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tiempo (min)</label>
                  <input
                    type='number'
                    value={settings.timeLimit}
                    onChange={e =>
                      setSettings({ ...settings, timeLimit: parseInt(e.target.value) || 0 })
                    }
                  />
                  <small>0 = sin límite</small>
                </div>
                <div className={styles.formGroup}>
                  <label>Intentos</label>
                  <input
                    type='number'
                    value={settings.maxAttempts}
                    onChange={e =>
                      setSettings({ ...settings, maxAttempts: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Score mínimo (%)</label>
                  <input
                    type='number'
                    value={settings.passingScore}
                    onChange={e =>
                      setSettings({ ...settings, passingScore: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </div>
            <div className={styles.settingsSection}>
              <h3>Opciones</h3>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.shuffleQuestions}
                    onChange={e =>
                      setSettings({ ...settings, shuffleQuestions: e.target.checked })
                    }
                  />{' '}
                  Mezclar preguntas
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.shuffleOptions}
                    onChange={e =>
                      setSettings({ ...settings, shuffleOptions: e.target.checked })
                    }
                  />{' '}
                  Mezclar opciones
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.showCorrectAnswers}
                    onChange={e =>
                      setSettings({ ...settings, showCorrectAnswers: e.target.checked })
                    }
                  />{' '}
                  Mostrar respuestas correctas
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.allowReview}
                    onChange={e =>
                      setSettings({ ...settings, allowReview: e.target.checked })
                    }
                  />{' '}
                  Permitir revisar
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.allowSkip}
                    onChange={e =>
                      setSettings({ ...settings, allowSkip: e.target.checked })
                    }
                  />{' '}
                  Permitir saltar preguntas
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.allowGoBack}
                    onChange={e =>
                      setSettings({ ...settings, allowGoBack: e.target.checked })
                    }
                  />{' '}
                  Permitir retroceder a pregunta anterior
                </label>
                <label className={styles.checkboxItem}>
                  <input
                    type='checkbox'
                    checked={settings.requireAllAnswers}
                    onChange={e =>
                      setSettings({ ...settings, requireAllAnswers: e.target.checked })
                    }
                  />{' '}
                  Requerir todas las respuestas antes de finalizar
                </label>
              </div>
            </div>
            
            <ThresholdsEditor
              thresholds={settings.performanceThresholds}
              onChange={(thresholds) => setSettings({ ...settings, performanceThresholds: thresholds })}
            />
            
            <div className={styles.settingsSection}>
              <h3>Programación</h3>
              <label className={styles.checkboxItem}>
                <input
                  type='checkbox'
                  checked={settings.publishImmediately}
                  onChange={e =>
                    setSettings({ ...settings, publishImmediately: e.target.checked })
                  }
                />{' '}
                Publicar inmediatamente
              </label>
              {!settings.publishImmediately && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Desde</label>
                    <input
                      type='datetime-local'
                      value={
                        settings.availableFrom
                          ? settings.availableFrom.toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={e =>
                        setSettings({ ...settings, availableFrom: new Date(e.target.value) })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hasta</label>
                    <input
                      type='datetime-local'
                      value={
                        settings.availableUntil
                          ? settings.availableUntil.toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={e =>
                        setSettings({
                          ...settings,
                          availableUntil: e.target.value ? new Date(e.target.value) : undefined
                        })
                      }
                    />
                  </div>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Fecha límite</label>
                <input
                  type='datetime-local'
                  value={
                    settings.dueDate ? settings.dueDate.toISOString().slice(0, 16) : ''
                  }
                  onChange={e =>
                    setSettings({
                      ...settings,
                      dueDate: e.target.value ? new Date(e.target.value) : undefined
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
        {tab === 'preview' && (
          <div>
            <div className={styles.previewHeader}>
              <h3>Vista Previa</h3>
              <p>Así verán los estudiantes la evaluación</p>
            </div>
            <div className={styles.quizPreview}>
              <div className={styles.quizTitle}>{settings.title || 'Sin título'}</div>
              {settings.description && (
                <div className={styles.quizDescription}>{settings.description}</div>
              )}
              <div className={styles.quizInfo}>
                <div className={styles.infoItem}>
                  <Clock size={14} />{' '}
                  <span>{settings.timeLimit > 0 ? settings.timeLimit + ' min' : 'Sin límite'}</span>
                </div>
                <div className={styles.infoItem}>
                  <FileText size={14} /> <span>{questions.length} preguntas</span>
                </div>
                <div className={styles.infoItem}>
                  <Target size={14} /> <span>{totalPoints} pts</span>
                </div>
                <div className={styles.infoItem}>
                  <Users size={14} /> <span>{settings.maxAttempts} intentos</span>
                </div>
              </div>
              <div className={styles.previewQuestions}>
                {questions.map((q, i) => (
                  <div key={q.id} className={styles.previewQuestion}>
                    <div className={styles.questionHeader}>
                      <span>Pregunta {i + 1}</span>
                      <span className={styles.questionPoints}>({q.points} pts)</span>
                    </div>
                    <div className={styles.questionText}>{q.question}</div>
                    {q.type === 'multiple-choice' && (
                      <div className={styles.questionOptions}>
                        {q.options?.map((opt, idx) => (
                          <div key={idx} className={styles.option}>
                            <input type='radio' disabled /> <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'true-false' && (
                      <div className={styles.questionOptions}>
                        <div className={styles.option}>
                          <input type='radio' disabled /> <span>Verdadero</span>
                        </div>
                        <div className={styles.option}>
                          <input type='radio' disabled /> <span>Falso</span>
                        </div>
                      </div>
                    )}
                    {(q.type === 'short-answer' || q.type === 'essay') && (
                      <div className={styles.answerInput}>
                        <textarea disabled rows={q.type === 'essay' ? 4 : 2} placeholder='Respuesta...' />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
