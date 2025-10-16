'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './SimulacroViewer.module.css';
import {
  Clock, ChevronLeft, ChevronRight, Flag, Send, AlertCircle,
  CheckCircle, XCircle, Eye, EyeOff, Award, Target, TrendingUp
} from 'lucide-react';
import { QuestionOption } from './SimulacroViewerComponents';
import { PerformanceThreshold } from '../admin/ThresholdsEditor';
import SummaryPage from './SummaryPage';

// ============================================================================
// INTERFACES
// ============================================================================

interface SimulacroData {
  id: string;
  title: string;
  description: string;
  instructions: string;
  timeLimitMinutes: number;
  passingScore: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  allowReview: boolean;
  allowSkip: boolean;
  allowGoBack: boolean;
  requireAllAnswers: boolean;
  performanceThresholds: PerformanceThreshold[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts?: number; // Intentos máximos permitidos (undefined = ilimitados)
  questions: Question[];
}

interface Question {
  id: string;
  questionText: string;
  questionImageUrl?: string;
  questionType: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay';
  options?: Option[];
  explanationText?: string;
  explanationImageUrl?: string;
  points: number;
  difficulty: string;
  orderIndex: number;
}

interface Option {
  id: string;
  optionText: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  feedbackText?: string;
}

interface StudentAnswer {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer?: string;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

interface SimulacroViewerProps {
  simulacroId: string;
  attemptId?: string;
  onComplete: (results: any) => void;
  onExit: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SimulacroViewer: React.FC<SimulacroViewerProps> = ({
  simulacroId,
  attemptId,
  onComplete,
  onExit
}) => {
  const [simulacro, setSimulacro] = useState<SimulacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // LOAD SIMULACRO DATA
  // ============================================================================

  useEffect(() => {
    loadSimulacro();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simulacroId]);

  const loadSimulacro = async () => {
    try {
      // TODO: Load from API
      // const response = await fetch(`/api/simulacros/${simulacroId}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockSimulacro: SimulacroData = {
        id: simulacroId,
        title: 'Simulacro de Matemáticas Básicas',
        description: 'Evaluación de conceptos fundamentales de matemáticas',
        instructions: 'Lee cuidadosamente cada pregunta. Tienes tiempo limitado. Puedes marcar preguntas para revisar después.',
        timeLimitMinutes: 30,
        passingScore: 70,
        showCorrectAnswers: true,
        showExplanations: true,
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
            messageHtml: '<h3 style="color: #10b981;">🎉 ¡Excelente trabajo!</h3><p>Has demostrado un dominio excepcional de los conceptos matemáticos básicos. ¡Sigue así!</p>'
          },
          {
            id: 'good',
            name: 'Bueno',
            minPercentage: 70,
            maxPercentage: 89,
            color: '#3b82f6',
            messageHtml: '<h3 style="color: #3b82f6;">👍 ¡Buen trabajo!</h3><p>Tienes un buen entendimiento de las matemáticas. Con un poco más de práctica alcanzarás la excelencia.</p>'
          },
          {
            id: 'needs-improvement',
            name: 'Necesita Mejorar',
            minPercentage: 0,
            maxPercentage: 69,
            color: '#ef4444',
            messageHtml: '<h3 style="color: #ef4444;">📚 Necesitas mejorar</h3><p>Te recomendamos repasar los conceptos fundamentales y practicar más ejercicios antes de volver a intentarlo.</p>'
          }
        ],
        shuffleQuestions: false,
        shuffleOptions: true,
        questions: generateMockQuestions()
      };

      setSimulacro(mockSimulacro);
      setTimeRemaining(mockSimulacro.timeLimitMinutes * 60);
      setLoading(false);
      startTimer();
    } catch (error) {
      console.error('Error loading simulacro:', error);
      setLoading(false);
    }
  };

  // ============================================================================
  // TIMER
  // ============================================================================

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // ANSWER HANDLING
  // ============================================================================

  const getCurrentAnswer = (): StudentAnswer => {
    const currentQuestion = simulacro?.questions[currentQuestionIndex];
    if (!currentQuestion) return createEmptyAnswer('');

    return answers[currentQuestion.id] || createEmptyAnswer(currentQuestion.id);
  };

  const createEmptyAnswer = (questionId: string): StudentAnswer => ({
    questionId,
    selectedOptionIds: [],
    textAnswer: '',
    isMarkedForReview: false,
    timeSpentSeconds: 0
  });

  const updateAnswer = (updates: Partial<StudentAnswer>) => {
    const currentQuestion = simulacro?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const currentAnswer = getCurrentAnswer();
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...currentAnswer,
        ...updates,
        timeSpentSeconds: currentAnswer.timeSpentSeconds + timeSpent
      }
    }));

    setQuestionStartTime(Date.now());
  };

  const selectOption = (optionId: string) => {
    const currentQuestion = simulacro?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const currentAnswer = getCurrentAnswer();

    if (currentQuestion.questionType === 'multiple-choice' || currentQuestion.questionType === 'true-false') {
      // Single selection
      updateAnswer({ selectedOptionIds: [optionId] });
    } else if (currentQuestion.questionType === 'multiple-select') {
      // Multiple selection
      const isSelected = currentAnswer.selectedOptionIds.includes(optionId);
      const newSelection = isSelected
        ? currentAnswer.selectedOptionIds.filter(id => id !== optionId)
        : [...currentAnswer.selectedOptionIds, optionId];
      updateAnswer({ selectedOptionIds: newSelection });
    }
  };

  const toggleMarkForReview = () => {
    const currentAnswer = getCurrentAnswer();
    updateAnswer({ isMarkedForReview: !currentAnswer.isMarkedForReview });
  };

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (simulacro?.questions.length || 0)) {
      // Save time spent on current question
      const currentAnswer = getCurrentAnswer();
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      if (simulacro?.questions[currentQuestionIndex]) {
        const currentQuestion = simulacro.questions[currentQuestionIndex];
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: {
            ...currentAnswer,
            timeSpentSeconds: currentAnswer.timeSpentSeconds + timeSpent
          }
        }));
      }

      setCurrentQuestionIndex(index);
      setQuestionStartTime(Date.now());
    }
  };

  const nextQuestion = () => goToQuestion(currentQuestionIndex + 1);
  
  const previousQuestion = () => {
    // Only allow going back if allowGoBack is enabled
    if (simulacro?.allowGoBack) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const skipQuestion = () => {
    // Skip to next question without requiring an answer
    if (simulacro?.allowSkip) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  // ============================================================================
  // SUBMISSION
  // ============================================================================

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleSubmit(true);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const unanswered = simulacro?.questions.filter(q => {
        const answer = answers[q.id];
        return !answer || (
          answer.selectedOptionIds.length === 0 && !answer.textAnswer
        );
      }).length || 0;

      // Si requireAllAnswers está activado, no permitir enviar con preguntas sin responder
      if (simulacro?.requireAllAnswers && unanswered > 0) {
        alert(
          `Debes responder todas las preguntas antes de finalizar. Te faltan ${unanswered} pregunta(s) por responder.`
        );
        return;
      }

      // Si no es obligatorio, solo advertir
      if (unanswered > 0) {
        const confirm = window.confirm(
          `Tienes ${unanswered} pregunta(s) sin responder. ¿Estás seguro de enviar el simulacro?`
        );
        if (!confirm) return;
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitted(true);

    // Calculate results
    const results = calculateResults();
    setResults(results);
    setShowResults(true);

    // TODO: Save to database
    // await fetch(`/api/simulacros/${simulacroId}/submit`, {
    //   method: 'POST',
    //   body: JSON.stringify({ attemptId, answers, results })
    // });

    onComplete(results);
  };

  const calculateResults = () => {
    if (!simulacro) return null;

    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const questionResults = simulacro.questions.map(question => {
      const answer = answers[question.id];
      const isCorrect = checkAnswer(question, answer);
      
      totalPoints += question.points;
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        isCorrect,
        points: isCorrect ? question.points : 0
      };
    });

    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= simulacro.passingScore;

    // Determinar el rango de desempeño alcanzado
    const achievedThreshold = simulacro.performanceThresholds.find(
      threshold => percentage >= threshold.minPercentage && percentage <= threshold.maxPercentage
    );

    return {
      totalQuestions: simulacro.questions.length,
      answeredQuestions: Object.keys(answers).length,
      correctAnswers,
      totalPoints,
      earnedPoints,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      performanceThreshold: achievedThreshold,
      questionResults,
      timeSpent: simulacro.timeLimitMinutes * 60 - timeRemaining
    };
  };

  const checkAnswer = (question: Question, answer?: StudentAnswer): boolean => {
    if (!answer) return false;

    if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
      const correctOption = question.options?.find(opt => opt.isCorrect);
      return answer.selectedOptionIds[0] === correctOption?.id;
    } else if (question.questionType === 'multiple-select') {
      const correctOptionIds = question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
      if (correctOptionIds.length !== answer.selectedOptionIds.length) return false;
      return correctOptionIds.every(id => answer.selectedOptionIds.includes(id));
    }

    return false;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Cargando simulacro...</p>
      </div>
    );
  }

  if (!simulacro) {
    return (
      <div className={styles.error}>
        <AlertCircle size={48} />
        <p>Error al cargar el simulacro</p>
        <button onClick={onExit}>Volver</button>
      </div>
    );
  }

  if (showResults && results) {
    // Preparar datos para SummaryPage
    const incorrectAnswers = results.totalQuestions - results.correctAnswers;
    const blankAnswers = results.totalQuestions - results.answeredQuestions;
    
    const currentAttempt = {
      score: results.percentage,
      percentage: results.percentage,
      timeSpentSeconds: results.timeSpent,
      correctAnswers: results.correctAnswers,
      incorrectAnswers,
      blankAnswers,
      passed: results.passed,
      date: new Date()
    };

    // TODO: Obtener datos reales de la base de datos
    const platformStats = {
      totalStudents: 423,
      totalAttempts: 1547,
      averageScore: 72.5,
      averageTime: 85 * 60, // 85 minutos en segundos
      passRate: 68.5
    };

    // TODO: Obtener historial real de la base de datos
    const attemptHistory = [{
      attemptNumber: 1,
      date: new Date(),
      score: results.percentage,
      timeSpent: results.timeSpent,
      correctAnswers: results.correctAnswers,
      incorrectAnswers,
      blankAnswers
    }];

    return (
      <SummaryPage
        simulacroTitle={simulacro.title}
        totalQuestions={simulacro.questions.length}
        timeLimitMinutes={simulacro.timeLimitMinutes}
        passingScore={simulacro.passingScore}
        performanceThreshold={results.performanceThreshold}
        maxAttempts={simulacro.maxAttempts}
        currentAttempt={currentAttempt}
        attemptHistory={attemptHistory}
        platformStats={platformStats}
        onRetry={() => {
          // Reiniciar simulacro
          setShowResults(false);
          setIsSubmitted(false);
          setAnswers({});
          setCurrentQuestionIndex(0);
          setTimeRemaining(simulacro.timeLimitMinutes * 60);
        }}
        onExit={onExit}
        onReviewAnswers={() => setShowResults(false)}
      />
    );
  }

  const currentQuestion = simulacro.questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();
  const progress = ((currentQuestionIndex + 1) / simulacro.questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(qId => {
    const answer = answers[qId];
    return answer.selectedOptionIds.length > 0 || answer.textAnswer;
  }).length;
  
  const unansweredCount = simulacro.questions.length - answeredCount;
  const canSubmit = !simulacro.requireAllAnswers || unansweredCount === 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{simulacro.title}</h1>
          <div className={styles.progress}>
            <span>Pregunta {currentQuestionIndex + 1} de {simulacro.questions.length}</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={`${styles.timer} ${timeRemaining < 300 ? styles.warning : ''}`}>
            <Clock size={20} />
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <button 
            onClick={() => handleSubmit()} 
            className={`${styles.submitButton} ${!canSubmit ? styles.submitDisabled : ''}`}
            title={!canSubmit ? `Debes responder ${unansweredCount} pregunta(s) más` : 'Enviar simulacro'}
          >
            <Send size={18} />
            <span>Enviar</span>
            {simulacro.requireAllAnswers && unansweredCount > 0 && (
              <span className={styles.pendingBadge}>{unansweredCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Question Panel */}
        <div className={styles.questionPanel}>
          <div className={styles.questionHeader}>
            <div className={styles.questionNumber}>
              Pregunta {currentQuestionIndex + 1}
            </div>
            <button
              onClick={toggleMarkForReview}
              className={`${styles.markButton} ${currentAnswer.isMarkedForReview ? styles.marked : ''}`}
            >
              <Flag size={16} />
              <span>{currentAnswer.isMarkedForReview ? 'Marcada' : 'Marcar para revisar'}</span>
            </button>
          </div>

          <div className={styles.questionContent}>
            <div className={styles.questionText}>
              {currentQuestion.questionText}
            </div>

            {currentQuestion.questionImageUrl && (
              <div className={styles.questionImage}>
                <img src={currentQuestion.questionImageUrl} alt="Pregunta" />
              </div>
            )}

            {/* Options */}
            {currentQuestion.options && (
              <div className={styles.optionsList}>
                {currentQuestion.options.map((option, index) => (
                  <QuestionOption
                    key={option.id}
                    option={option}
                    index={index}
                    isSelected={currentAnswer.selectedOptionIds.includes(option.id)}
                    questionType={currentQuestion.questionType}
                    onSelect={() => selectOption(option.id)}
                  />
                ))}
              </div>
            )}

            {/* Text Answer */}
            {(currentQuestion.questionType === 'short-answer' || currentQuestion.questionType === 'essay') && (
              <textarea
                value={currentAnswer.textAnswer || ''}
                onChange={(e) => updateAnswer({ textAnswer: e.target.value })}
                placeholder="Escribe tu respuesta aquí..."
                className={styles.textAnswer}
                rows={currentQuestion.questionType === 'essay' ? 10 : 3}
              />
            )}
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0 || !simulacro.allowGoBack}
              className={styles.navButton}
              title={!simulacro.allowGoBack ? 'No se permite retroceder' : ''}
            >
              <ChevronLeft size={18} />
              <span>Anterior</span>
            </button>

            <div className={styles.navInfo}>
              {answeredCount} de {simulacro.questions.length} respondidas
            </div>

            {simulacro.allowSkip && currentQuestionIndex < simulacro.questions.length - 1 && (
              <button
                onClick={skipQuestion}
                className={`${styles.navButton} ${styles.skipButton}`}
                title="Saltar esta pregunta sin responder"
              >
                <span>Saltar</span>
                <ChevronRight size={18} />
              </button>
            )}

            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === simulacro.questions.length - 1}
              className={styles.navButton}
            >
              <span>Siguiente</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Questions Navigator */}
        <div className={styles.questionsNavigator}>
          <h3>Navegación</h3>
          <div className={styles.questionsGrid}>
            {simulacro.questions.map((question, index) => {
              const answer = answers[question.id];
              const isAnswered = answer && (answer.selectedOptionIds.length > 0 || answer.textAnswer);
              const isMarked = answer?.isMarkedForReview;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`${styles.questionNavButton} ${
                    isCurrent ? styles.current : ''
                  } ${isAnswered ? styles.answered : ''} ${isMarked ? styles.marked : ''}`}
                >
                  {index + 1}
                  {isMarked && <Flag size={12} className={styles.flagIcon} />}
                </button>
              );
            })}
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.current}`} />
              <span>Actual</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.answered}`} />
              <span>Respondida</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.marked}`} />
              <span>Marcada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CONTINUED IN NEXT FILE...

export default SimulacroViewer;

// Helper function to generate mock questions
function generateMockQuestions(): Question[] {
  return [
    {
      id: 'q1',
      questionText: '¿Cuál es el resultado de 2 + 2?',
      questionType: 'multiple-choice',
      options: [
        { id: 'opt1', optionText: '3', isCorrect: false },
        { id: 'opt2', optionText: '4', isCorrect: true },
        { id: 'opt3', optionText: '5', isCorrect: false },
        { id: 'opt4', optionText: '6', isCorrect: false }
      ],
      explanationText: 'La suma de 2 + 2 es igual a 4.',
      points: 1,
      difficulty: 'easy',
      orderIndex: 0
    }
    // Add more mock questions as needed
  ];
}
