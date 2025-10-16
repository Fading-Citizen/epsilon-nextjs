'use client';

import React from 'react';
import styles from './SimulacroBuilder.module.css';
import { Clock, Target, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import type { SimulacroSettings, SimulacroQuestion } from './SimulacroBuilder';

// ============================================================================
// PREVIEW TAB COMPONENT
// ============================================================================

interface PreviewTabProps {
  settings: SimulacroSettings;
  questions: SimulacroQuestion[];
  totalPoints: number;
  estimatedDuration: number;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  settings,
  questions,
  totalPoints,
  estimatedDuration
}) => {
  const getDifficultyDistribution = () => {
    const dist = { easy: 0, medium: 0, hard: 0 };
    questions.forEach(q => dist[q.difficulty]++);
    return dist;
  };

  const diffDist = getDifficultyDistribution();

  return (
    <div className={styles.previewTab}>
      {/* Header Section */}
      <div className={styles.previewHeader}>
        {settings.thumbnailUrl && (
          <div style={{ marginBottom: '1.5rem' }}>
            <img 
              src={settings.thumbnailUrl} 
              alt={settings.title}
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        )}

        <h1 className={styles.previewTitle}>
          {settings.title || 'Sin título'}
        </h1>

        {settings.description && (
          <p className={styles.previewDescription}>
            {settings.description}
          </p>
        )}

        <div className={styles.previewStats}>
          <div className={styles.previewStatItem}>
            <FileText size={20} />
            <div className={styles.previewStatText}>
              <span className={styles.previewStatLabel}>Preguntas</span>
              <span className={styles.previewStatValue}>{questions.length}</span>
            </div>
          </div>

          <div className={styles.previewStatItem}>
            <Target size={20} />
            <div className={styles.previewStatText}>
              <span className={styles.previewStatLabel}>Puntos</span>
              <span className={styles.previewStatValue}>{totalPoints}</span>
            </div>
          </div>

          <div className={styles.previewStatItem}>
            <Clock size={20} />
            <div className={styles.previewStatText}>
              <span className={styles.previewStatLabel}>Tiempo Límite</span>
              <span className={styles.previewStatValue}>{settings.timeLimitMinutes} min</span>
            </div>
          </div>

          <div className={styles.previewStatItem}>
            <CheckCircle size={20} />
            <div className={styles.previewStatText}>
              <span className={styles.previewStatLabel}>Puntaje Mínimo</span>
              <span className={styles.previewStatValue}>{settings.passingScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {settings.instructions && (
        <div className={styles.settingsSection}>
          <h3>Instrucciones</h3>
          <div style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: '1.6' }}>
            {settings.instructions}
          </div>
        </div>
      )}

      {/* Configuration Details */}
      <div className={styles.settingsSection}>
        <h3>Configuración</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <ConfigItem label="Servicio/Producto" value={settings.servicio} />
          <ConfigItem label="Categoría" value={settings.category} />
          <ConfigItem label="Intentos Permitidos" value={`${settings.maxAttempts} intento${settings.maxAttempts > 1 ? 's' : ''}`} />
          <ConfigItem 
            label="Tipo de Acceso" 
            value={settings.isSample ? 'Muestra Gratuita' : `Requiere: ${settings.requiresSubscription}`} 
          />
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>
            Opciones de Comportamiento
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem' }}>
            <OptionItem enabled={settings.shuffleQuestions} label="Mezclar preguntas" />
            <OptionItem enabled={settings.shuffleOptions} label="Mezclar opciones" />
            <OptionItem enabled={settings.showCorrectAnswers} label="Mostrar respuestas correctas" />
            <OptionItem enabled={settings.showExplanations} label="Mostrar explicaciones" />
            <OptionItem enabled={settings.allowReview} label="Permitir revisión" />
            <OptionItem enabled={settings.showResultsImmediately} label="Resultados inmediatos" />
          </div>
        </div>
      </div>

      {/* Questions Distribution */}
      {questions.length > 0 && (
        <div className={styles.settingsSection}>
          <h3>Distribución de Preguntas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                {diffDist.easy}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#166534' }}>Fáciles</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fffbeb', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e' }}>
                {diffDist.medium}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#a16207' }}>Medias</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}>
                {diffDist.hard}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Difíciles</div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Questions Preview */}
      {questions.length > 0 && (
        <div className={styles.settingsSection}>
          <h3>Vista Previa de Preguntas (primeras 3)</h3>
          {questions.slice(0, 3).map((question, index) => (
            <div 
              key={question.id} 
              style={{ 
                marginBottom: '1.5rem', 
                paddingBottom: '1.5rem', 
                borderBottom: index < 2 ? '1px solid #f1f5f9' : 'none' 
              }}
            >
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.625rem' }}>
                {index + 1}. {question.questionText}
              </div>
              
              {question.questionImageUrl && (
                <div style={{ marginBottom: '0.625rem' }}>
                  <img 
                    src={question.questionImageUrl} 
                    alt="Pregunta" 
                    style={{ maxWidth: '300px', borderRadius: '6px' }}
                  />
                </div>
              )}

              {question.options && (
                <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {question.options.map((opt, i) => (
                    <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span style={{ color: '#475569' }}>{opt.optionText}</span>
                      {opt.optionImageUrl && <span>📷</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {questions.length > 3 && (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>
              ... y {questions.length - 3} pregunta{questions.length - 3 !== 1 ? 's' : ''} más
            </div>
          )}
        </div>
      )}

      {questions.length === 0 && (
        <div className={styles.emptyState} style={{ margin: '2rem 0' }}>
          <AlertCircle size={48} />
          <p>No hay preguntas para previsualizar</p>
        </div>
      )}
    </div>
  );
};

// Helper Components

const ConfigItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: '0.9375rem', color: '#1e293b', fontWeight: 600 }}>{value}</span>
  </div>
);

const OptionItem: React.FC<{ enabled: boolean; label: string }> = ({ enabled, label }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.5rem',
    padding: '0.5rem',
    background: enabled ? '#f0fdf4' : '#fef2f2',
    borderRadius: '4px'
  }}>
    {enabled ? (
      <CheckCircle size={16} style={{ color: '#15803d' }} />
    ) : (
      <AlertCircle size={16} style={{ color: '#991b1b' }} />
    )}
    <span style={{ fontSize: '0.875rem', color: enabled ? '#15803d' : '#991b1b' }}>
      {label}
    </span>
  </div>
);

export default PreviewTab;
