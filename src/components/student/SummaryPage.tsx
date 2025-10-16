'use client';

import React from 'react';
import styles from './SummaryPage.module.css';
import {
  Clock, CheckCircle, XCircle, Circle, TrendingUp, Users,
  Award, Target, BarChart3, Activity, Calendar, RefreshCw, Eye
} from 'lucide-react';
import { PerformanceThreshold } from '../admin/ThresholdsEditor';

// ============================================================================
// INTERFACES
// ============================================================================

interface AttemptHistory {
  attemptNumber: number;
  date: Date;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  incorrectAnswers: number;
  blankAnswers: number;
}

interface PlatformStats {
  totalAttempts: number;
  averageScore: number;
  averageTime: number;
  totalStudents: number;
  passRate: number;
}

interface LeaderboardEntry {
  position: number;
  userName: string;
  score: number;
  percentage: number;
  timeSpent: number;
  date: Date;
  isCurrentUser?: boolean;
}

interface SummaryPageProps {
  // Datos del simulacro
  simulacroTitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScore: number;
  performanceThreshold?: PerformanceThreshold;
  maxAttempts?: number; // Intentos máximos permitidos (undefined = ilimitados)
  
  // Resultados del intento actual
  currentAttempt: {
    score: number;
    percentage: number;
    timeSpentSeconds: number;
    correctAnswers: number;
    incorrectAnswers: number;
    blankAnswers: number;
    passed: boolean;
    date: Date;
  };
  
  // Historial de intentos del estudiante
  attemptHistory?: AttemptHistory[];
  
  // Estadísticas de la plataforma
  platformStats?: PlatformStats;
  
  // Tabla de clasificación (Top 30)
  leaderboard?: LeaderboardEntry[];
  userPosition?: number; // Posición del usuario actual en el ranking
  
  // Callbacks
  onRetry?: () => void;
  onExit?: () => void;
  onReviewAnswers?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SummaryPage: React.FC<SummaryPageProps> = ({
  simulacroTitle,
  totalQuestions,
  timeLimitMinutes,
  passingScore,
  performanceThreshold,
  maxAttempts,
  currentAttempt,
  attemptHistory = [],
  platformStats,
  leaderboard = [],
  userPosition,
  onRetry,
  onExit,
  onReviewAnswers
}) => {
  
  // Calcular intentos usados y restantes
  const attemptsUsed = attemptHistory.length;
  const attemptsRemaining = maxAttempts ? maxAttempts - attemptsUsed : null; // null = ilimitados
  const canRetry = !maxAttempts || (attemptsRemaining !== null && attemptsRemaining > 0);
  
  // Calcular promedio de intentos previos
  const calculateStudentAverage = () => {
    if (attemptHistory.length === 0) return null;
    
    const totalScore = attemptHistory.reduce((sum, attempt) => sum + attempt.score, 0);
    const avgScore = totalScore / attemptHistory.length;
    
    const totalTime = attemptHistory.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    const avgTime = totalTime / attemptHistory.length;
    
    return {
      averageScore: avgScore,
      averageTime: avgTime,
      totalAttempts: attemptHistory.length
    };
  };

  const studentAverage = calculateStudentAverage();
  
  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeVerbose = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Determinar color según performance
  const getPerformanceColor = () => {
    if (performanceThreshold) return performanceThreshold.color;
    if (currentAttempt.percentage >= 90) return '#10b981';
    if (currentAttempt.percentage >= 70) return '#3b82f6';
    if (currentAttempt.percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const performanceColor = getPerformanceColor();

  // Calcular mejora respecto al promedio personal
  const getImprovementText = () => {
    if (!studentAverage || attemptHistory.length < 2) return null;
    
    const diff = currentAttempt.percentage - studentAverage.averageScore;
    if (Math.abs(diff) < 1) return { text: 'Similar a tu promedio', icon: '➡️', color: '#64748b' };
    if (diff > 0) return { text: `+${diff.toFixed(1)}% mejor que tu promedio`, icon: '📈', color: '#10b981' };
    return { text: `${diff.toFixed(1)}% por debajo de tu promedio`, icon: '📉', color: '#ef4444' };
  };

  const improvement = getImprovementText();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <Award size={48} color={performanceColor} />
          </div>
          <div className={styles.headerText}>
            <h1>Resumen del Simulacro</h1>
            <p>{simulacroTitle}</p>
            <div className={styles.headerDate}>
              <Calendar size={16} />
              <span>{currentAttempt.date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Card Principal */}
      <div className={styles.scoreSection}>
        <div 
          className={styles.mainScoreCard}
          style={{ borderColor: performanceColor }}
        >
          <div className={styles.scoreValue} style={{ color: performanceColor }}>
            {currentAttempt.percentage.toFixed(1)}%
          </div>
          <div className={styles.scoreLabel}>
            {currentAttempt.passed ? '✅ APROBADO' : '❌ NO APROBADO'}
          </div>
          {performanceThreshold && (
            <div 
              className={styles.performanceBadge}
              style={{ 
                background: `${performanceThreshold.color}20`,
                color: performanceThreshold.color,
                borderColor: performanceThreshold.color
              }}
            >
              {performanceThreshold.name}
            </div>
          )}
        </div>
      </div>

      {/* Performance Message */}
      {performanceThreshold && (
        <div 
          className={styles.performanceMessage}
          style={{ 
            borderLeftColor: performanceThreshold.color,
            background: `${performanceThreshold.color}08`
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: performanceThreshold.messageHtml }} />
        </div>
      )}

      {/* Grid de Estadísticas Principales */}
      <div className={styles.statsGrid}>
        {/* Tiempo Utilizado */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
            <Clock size={32} color="#3b82f6" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tiempo Utilizado</div>
            <div className={styles.statValue}>
              {formatTimeVerbose(currentAttempt.timeSpentSeconds)}
            </div>
            <div className={styles.statSubtext}>
              de {timeLimitMinutes} minutos disponibles
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${Math.min((currentAttempt.timeSpentSeconds / (timeLimitMinutes * 60)) * 100, 100)}%`,
                  background: '#3b82f6'
                }}
              />
            </div>
          </div>
        </div>

        {/* Respuestas Correctas */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Respuestas Correctas</div>
            <div className={styles.statValue} style={{ color: '#10b981' }}>
              {currentAttempt.correctAnswers}
            </div>
            <div className={styles.statSubtext}>
              de {totalQuestions} preguntas
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${(currentAttempt.correctAnswers / totalQuestions) * 100}%`,
                  background: '#10b981'
                }}
              />
            </div>
          </div>
        </div>

        {/* Respuestas Incorrectas */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fee2e2' }}>
            <XCircle size={32} color="#ef4444" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Respuestas Incorrectas</div>
            <div className={styles.statValue} style={{ color: '#ef4444' }}>
              {currentAttempt.incorrectAnswers}
            </div>
            <div className={styles.statSubtext}>
              de {totalQuestions} preguntas
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${(currentAttempt.incorrectAnswers / totalQuestions) * 100}%`,
                  background: '#ef4444'
                }}
              />
            </div>
          </div>
        </div>

        {/* Preguntas en Blanco */}
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f3f4f6' }}>
            <Circle size={32} color="#94a3b8" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Preguntas en Blanco</div>
            <div className={styles.statValue} style={{ color: '#94a3b8' }}>
              {currentAttempt.blankAnswers}
            </div>
            <div className={styles.statSubtext}>
              sin responder
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${(currentAttempt.blankAnswers / totalQuestions) * 100}%`,
                  background: '#94a3b8'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de Distribución de Respuestas */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <BarChart3 size={24} />
          Distribución de Respuestas
        </h2>
        <div className={styles.distributionChart}>
          <div 
            className={styles.chartBar}
            style={{ 
              width: `${(currentAttempt.correctAnswers / totalQuestions) * 100}%`,
              background: '#10b981'
            }}
          >
            <span className={styles.chartLabel}>
              {currentAttempt.correctAnswers} Correctas
            </span>
          </div>
          <div 
            className={styles.chartBar}
            style={{ 
              width: `${(currentAttempt.incorrectAnswers / totalQuestions) * 100}%`,
              background: '#ef4444'
            }}
          >
            <span className={styles.chartLabel}>
              {currentAttempt.incorrectAnswers} Incorrectas
            </span>
          </div>
          {currentAttempt.blankAnswers > 0 && (
            <div 
              className={styles.chartBar}
              style={{ 
                width: `${(currentAttempt.blankAnswers / totalQuestions) * 100}%`,
                background: '#94a3b8'
              }}
            >
              <span className={styles.chartLabel}>
                {currentAttempt.blankAnswers} En Blanco
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comparación con Promedio de la Plataforma */}
      {platformStats && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Users size={24} />
            Comparación con la Plataforma
          </h2>
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard}>
              <div className={styles.comparisonHeader}>
                <Target size={20} />
                <span>Tu Puntaje vs Promedio</span>
              </div>
              <div className={styles.comparisonContent}>
                <div className={styles.comparisonBar}>
                  <div className={styles.comparisonLabel}>
                    <span>Tú</span>
                    <span className={styles.comparisonValue} style={{ color: performanceColor }}>
                      {currentAttempt.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${currentAttempt.percentage}%`,
                        background: performanceColor
                      }}
                    />
                  </div>
                </div>
                <div className={styles.comparisonBar}>
                  <div className={styles.comparisonLabel}>
                    <span>Promedio</span>
                    <span className={styles.comparisonValue}>
                      {platformStats.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ 
                        width: `${platformStats.averageScore}%`,
                        background: '#94a3b8'
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.comparisonDiff}>
                {currentAttempt.percentage > platformStats.averageScore ? (
                  <div className={styles.diffPositive}>
                    <TrendingUp size={16} />
                    <span>
                      +{(currentAttempt.percentage - platformStats.averageScore).toFixed(1)}% 
                      por encima del promedio
                    </span>
                  </div>
                ) : currentAttempt.percentage < platformStats.averageScore ? (
                  <div className={styles.diffNegative}>
                    <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />
                    <span>
                      {(currentAttempt.percentage - platformStats.averageScore).toFixed(1)}% 
                      por debajo del promedio
                    </span>
                  </div>
                ) : (
                  <div className={styles.diffNeutral}>
                    <Activity size={16} />
                    <span>Igual al promedio</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.platformStatsCards}>
              <div className={styles.miniStatCard}>
                <Users size={24} color="#6969bc" />
                <div className={styles.miniStatContent}>
                  <div className={styles.miniStatValue}>{platformStats.totalStudents}</div>
                  <div className={styles.miniStatLabel}>Estudiantes</div>
                </div>
              </div>
              <div className={styles.miniStatCard}>
                <RefreshCw size={24} color="#6969bc" />
                <div className={styles.miniStatContent}>
                  <div className={styles.miniStatValue}>{platformStats.totalAttempts}</div>
                  <div className={styles.miniStatLabel}>Intentos Totales</div>
                </div>
              </div>
              <div className={styles.miniStatCard}>
                <Award size={24} color="#6969bc" />
                <div className={styles.miniStatContent}>
                  <div className={styles.miniStatValue}>{platformStats.passRate.toFixed(0)}%</div>
                  <div className={styles.miniStatLabel}>Tasa de Aprobación</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Intentos */}
      {attemptHistory.length > 1 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Activity size={24} />
            Tu Progreso ({attemptHistory.length} intentos)
          </h2>
          
          {/* Promedio Personal */}
          {studentAverage && (
            <div className={styles.studentAverageCard}>
              <div className={styles.averageHeader}>
                <TrendingUp size={20} />
                <span>Tu Promedio General</span>
              </div>
              <div className={styles.averageContent}>
                <div className={styles.averageStat}>
                  <div className={styles.averageValue}>{studentAverage.averageScore.toFixed(1)}%</div>
                  <div className={styles.averageLabel}>Puntaje Promedio</div>
                </div>
                <div className={styles.averageStat}>
                  <div className={styles.averageValue}>{formatTimeVerbose(Math.round(studentAverage.averageTime))}</div>
                  <div className={styles.averageLabel}>Tiempo Promedio</div>
                </div>
              </div>
              {improvement && (
                <div 
                  className={styles.improvementBadge}
                  style={{ color: improvement.color }}
                >
                  {improvement.icon} {improvement.text}
                </div>
              )}
            </div>
          )}

          {/* Lista de Intentos */}
          <div className={styles.attemptsList}>
            {attemptHistory.map((attempt) => (
              <div 
                key={attempt.attemptNumber}
                className={`${styles.attemptItem} ${
                  attempt.attemptNumber === attemptHistory.length ? styles.currentAttempt : ''
                }`}
              >
                <div className={styles.attemptNumber}>
                  Intento #{attempt.attemptNumber}
                  {attempt.attemptNumber === attemptHistory.length && (
                    <span className={styles.currentBadge}>Actual</span>
                  )}
                </div>
                <div className={styles.attemptStats}>
                  <div className={styles.attemptStat}>
                    <Target size={16} />
                    <span>{attempt.score.toFixed(1)}%</span>
                  </div>
                  <div className={styles.attemptStat}>
                    <CheckCircle size={16} color="#10b981" />
                    <span>{attempt.correctAnswers}</span>
                  </div>
                  <div className={styles.attemptStat}>
                    <XCircle size={16} color="#ef4444" />
                    <span>{attempt.incorrectAnswers}</span>
                  </div>
                  <div className={styles.attemptStat}>
                    <Circle size={16} color="#94a3b8" />
                    <span>{attempt.blankAnswers}</span>
                  </div>
                  <div className={styles.attemptStat}>
                    <Clock size={16} />
                    <span>{formatTimeVerbose(attempt.timeSpent)}</span>
                  </div>
                </div>
                <div className={styles.attemptProgress}>
                  <div 
                    className={styles.attemptProgressBar}
                    style={{ width: `${attempt.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gráfica de Evolución */}
          <div className={styles.evolutionChart}>
            <div className={styles.chartTitle}>Evolución de Puntajes</div>
            <div className={styles.chartContainer}>
              {attemptHistory.map((attempt, index) => (
                <div key={attempt.attemptNumber} className={styles.chartColumn}>
                  <div 
                    className={styles.chartColumnBar}
                    style={{ 
                      height: `${attempt.score}%`,
                      background: index === attemptHistory.length - 1 ? performanceColor : '#cbd5e1'
                    }}
                  >
                    <span className={styles.chartColumnValue}>
                      {attempt.score.toFixed(0)}%
                    </span>
                  </div>
                  <div className={styles.chartColumnLabel}>#{attempt.attemptNumber}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Clasificación (Top 30) */}
      {leaderboard && leaderboard.length > 0 && (
        <div className={styles.leaderboardSection}>
          <div className={styles.sectionHeader}>
            <Award size={24} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Tabla de Clasificación</h2>
          </div>
          <p className={styles.sectionSubtitle}>
            Top 30 mejores resultados en este simulacro
            {userPosition && (
              <span className={styles.userPositionBadge}>
                Tu posición: #{userPosition}
              </span>
            )}
          </p>

          <div className={styles.leaderboardContainer}>
            <div className={styles.leaderboardHeader}>
              <div className={styles.leaderboardHeaderCell} style={{ width: '60px' }}>Pos</div>
              <div className={styles.leaderboardHeaderCell} style={{ flex: 1 }}>Estudiante</div>
              <div className={styles.leaderboardHeaderCell} style={{ width: '100px' }}>Puntaje</div>
              <div className={styles.leaderboardHeaderCell} style={{ width: '100px' }}>Tiempo</div>
              <div className={styles.leaderboardHeaderCell} style={{ width: '120px' }}>Fecha</div>
            </div>

            <div className={styles.leaderboardBody}>
              {leaderboard.map((entry) => (
                <div 
                  key={entry.position}
                  className={`${styles.leaderboardRow} ${entry.isCurrentUser ? styles.leaderboardRowHighlight : ''}`}
                >
                  <div className={styles.leaderboardCell} style={{ width: '60px' }}>
                    <div className={styles.positionBadge}>
                      {entry.position <= 3 ? (
                        <span className={styles.positionMedal}>
                          {entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className={styles.positionNumber}>#{entry.position}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.leaderboardCell} style={{ flex: 1 }}>
                    <div className={styles.userName}>
                      {entry.userName}
                      {entry.isCurrentUser && (
                        <span className={styles.youBadge}>Tú</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.leaderboardCell} style={{ width: '100px' }}>
                    <div className={styles.scoreValue}>
                      <span className={styles.scorePercentage}>{entry.percentage.toFixed(1)}%</span>
                      <span className={styles.scorePoints}>({entry.score} pts)</span>
                    </div>
                  </div>
                  
                  <div className={styles.leaderboardCell} style={{ width: '100px' }}>
                    <div className={styles.timeValue}>
                      {Math.floor(entry.timeSpent / 60)}:{(entry.timeSpent % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  <div className={styles.leaderboardCell} style={{ width: '120px' }}>
                    <div className={styles.dateValue}>
                      {entry.date.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {userPosition && userPosition > 30 && (
            <div className={styles.userPositionNotice}>
              <Activity size={18} />
              <span>
                Estás en la posición <strong>#{userPosition}</strong>. 
                ¡Sigue mejorando para entrar al Top 30!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className={styles.actions}>
        {/* Información de intentos */}
        {maxAttempts && (
          <div className={styles.attemptsInfo}>
            <div className={styles.attemptsInfoIcon}>
              <Target size={20} color={canRetry ? '#3b82f6' : '#ef4444'} />
            </div>
            <div className={styles.attemptsInfoText}>
              <div className={styles.attemptsInfoLabel}>Intentos realizados</div>
              <div className={styles.attemptsInfoValue}>
                {attemptsUsed} de {maxAttempts}
                {attemptsRemaining !== null && (
                  <span className={styles.attemptsRemaining}>
                    {attemptsRemaining > 0 
                      ? ` (${attemptsRemaining} restante${attemptsRemaining !== 1 ? 's' : ''})` 
                      : ' (sin intentos restantes)'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className={styles.actionButtons}>
          {onReviewAnswers && (
            <button onClick={onReviewAnswers} className={styles.actionButtonSecondary}>
              <Eye size={20} />
              Revisar Preguntas
            </button>
          )}
          {onRetry && (
            <button 
              onClick={onRetry} 
              className={styles.actionButtonPrimary}
              disabled={!canRetry}
              title={!canRetry ? 'No quedan intentos disponibles' : 'Volver a presentar el simulacro'}
            >
              <RefreshCw size={20} />
              Volver a Presentar
            </button>
          )}
          {onExit && (
            <button onClick={onExit} className={styles.actionButtonOutline}>
              Salir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
