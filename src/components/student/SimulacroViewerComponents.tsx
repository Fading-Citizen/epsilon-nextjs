'use client';

import React from 'react';
import styles from './SimulacroViewer.module.css';
import { CheckCircle, XCircle, Award, Target, Clock, TrendingUp, Eye, X } from 'lucide-react';

// ============================================================================
// QUESTION OPTION COMPONENT
// ============================================================================

interface QuestionOptionProps {
  option: any;
  index: number;
  isSelected: boolean;
  questionType: string;
  onSelect: () => void;
  showCorrect?: boolean;
  isSubmitted?: boolean;
}

export const QuestionOption: React.FC<QuestionOptionProps> = ({
  option,
  index,
  isSelected,
  questionType,
  onSelect,
  showCorrect = false,
  isSubmitted = false
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const inputType = questionType === 'multiple-select' ? 'checkbox' : 'radio';

  const getOptionClass = () => {
    if (!isSubmitted) {
      return isSelected ? styles.optionSelected : styles.option;
    }

    if (showCorrect && option.isCorrect) {
      return styles.optionCorrect;
    }

    if (isSelected && !option.isCorrect) {
      return styles.optionIncorrect;
    }

    return styles.option;
  };

  return (
    <div
      className={getOptionClass()}
      onClick={!isSubmitted ? onSelect : undefined}
      style={{ cursor: isSubmitted ? 'default' : 'pointer' }}
    >
      <div className={styles.optionHeader}>
        <input
          type={inputType}
          checked={isSelected}
          onChange={onSelect}
          disabled={isSubmitted}
          className={styles.optionInput}
        />
        <span className={styles.optionLetter}>{letters[index]}</span>
      </div>

      <div className={styles.optionContent}>
        <div className={styles.optionText}>{option.optionText}</div>
        {option.optionImageUrl && (
          <div className={styles.optionImage}>
            <img src={option.optionImageUrl} alt={`Opción ${letters[index]}`} />
          </div>
        )}
      </div>

      {isSubmitted && showCorrect && option.isCorrect && (
        <CheckCircle size={20} className={styles.correctIcon} />
      )}
      {isSubmitted && isSelected && !option.isCorrect && (
        <XCircle size={20} className={styles.incorrectIcon} />
      )}
    </div>
  );
};

// ============================================================================
// RESULTS VIEW COMPONENT
// ============================================================================

interface ResultsViewProps {
  simulacro: any;
  answers: Record<string, any>;
  results: any;
  onReview: () => void;
  onExit: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  simulacro,
  answers,
  results,
  onReview,
  onExit
}) => {
  if (!results) return null;

  const getGradeColor = () => {
    if (results.percentage >= 90) return '#15803d';
    if (results.percentage >= 70) return '#6969bc';
    if (results.percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getGradeMessage = () => {
    if (results.passed) {
      if (results.percentage >= 90) return '¡Excelente trabajo!';
      if (results.percentage >= 80) return '¡Muy bien hecho!';
      return '¡Buen trabajo!';
    }
    return 'Sigue practicando';
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <div className={styles.resultsTitle}>
          <h1>Resultados del Simulacro</h1>
          <p>{simulacro.title}</p>
        </div>
        <button onClick={onExit} className={styles.closeButton}>
          <X size={24} />
        </button>
      </div>

      {/* Score Card */}
      <div className={styles.scoreCard} style={{ borderColor: getGradeColor() }}>
        <div className={styles.scoreIcon}>
          {results.passed ? (
            <Award size={64} color={getGradeColor()} />
          ) : (
            <Target size={64} color={getGradeColor()} />
          )}
        </div>

        <div className={styles.scoreValue} style={{ color: getGradeColor() }}>
          {results.percentage.toFixed(1)}%
        </div>

        <div className={styles.scoreMessage}>
          {getGradeMessage()}
        </div>

        <div className={styles.scoreStatus}>
          {results.passed ? (
            <div className={styles.passed}>
              <CheckCircle size={24} />
              <span>APROBADO</span>
            </div>
          ) : (
            <div className={styles.failed}>
              <XCircle size={24} />
              <span>NO APROBADO</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <Target size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{results.correctAnswers}/{results.totalQuestions}</div>
            <div className={styles.statLabel}>Respuestas Correctas</div>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <TrendingUp size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{results.earnedPoints}/{results.totalPoints}</div>
            <div className={styles.statLabel}>Puntos Obtenidos</div>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <Clock size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{Math.floor(results.timeSpent / 60)} min</div>
            <div className={styles.statLabel}>Tiempo Utilizado</div>
          </div>
        </div>

        <div className={styles.statItem}>
          <div className={styles.statIcon}>
            <Award size={32} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{simulacro.passingScore}%</div>
            <div className={styles.statLabel}>Puntaje Mínimo</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.resultsActions}>
        {simulacro.allowReview && (
          <button onClick={onReview} className={styles.reviewButton}>
            <Eye size={20} />
            <span>Revisar Respuestas</span>
          </button>
        )}
        <button onClick={onExit} className={styles.exitButton}>
          Finalizar
        </button>
      </div>

      {/* Question Results */}
      {simulacro.showCorrectAnswers && (
        <div className={styles.questionResults}>
          <h2>Detalle por Pregunta</h2>
          <div className={styles.questionResultsList}>
            {simulacro.questions.map((question: any, index: number) => {
              const answer = answers[question.id];
              const questionResult = results.questionResults.find((r: any) => r.questionId === question.id);
              const isCorrect = questionResult?.isCorrect;

              return (
                <div
                  key={question.id}
                  className={`${styles.questionResultItem} ${isCorrect ? styles.correct : styles.incorrect}`}
                >
                  <div className={styles.questionResultHeader}>
                    <div className={styles.questionResultNumber}>
                      Pregunta {index + 1}
                      {isCorrect ? (
                        <CheckCircle size={20} className={styles.correctIcon} />
                      ) : (
                        <XCircle size={20} className={styles.incorrectIcon} />
                      )}
                    </div>
                    <div className={styles.questionResultPoints}>
                      {questionResult?.points || 0}/{question.points} pts
                    </div>
                  </div>

                  <div className={styles.questionResultText}>
                    {question.questionText}
                  </div>

                  {question.questionImageUrl && (
                    <div className={styles.questionResultImage}>
                      <img src={question.questionImageUrl} alt="Pregunta" />
                    </div>
                  )}

                  {question.options && (
                    <div className={styles.questionResultOptions}>
                      {question.options.map((option: any, optIndex: number) => (
                        <QuestionOption
                          key={option.id}
                          option={option}
                          index={optIndex}
                          isSelected={answer?.selectedOptionIds?.includes(option.id)}
                          questionType={question.questionType}
                          onSelect={() => {}}
                          showCorrect={simulacro.showCorrectAnswers}
                          isSubmitted={true}
                        />
                      ))}
                    </div>
                  )}

                  {simulacro.showExplanations && question.explanationText && (
                    <div className={styles.explanation}>
                      <div className={styles.explanationHeader}>📚 Explicación</div>
                      <div className={styles.explanationText}>
                        {question.explanationText}
                      </div>
                      {question.explanationImageUrl && (
                        <div className={styles.explanationImage}>
                          <img src={question.explanationImageUrl} alt="Explicación" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
