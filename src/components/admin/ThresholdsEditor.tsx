'use client';

import React, { useState } from 'react';
import styles from './SimulacroBuilder.module.css';
import { Plus, Trash2, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

export interface PerformanceThreshold {
  id: string;
  name: string;
  minPercentage: number;
  maxPercentage: number;
  color: string;
  messageHtml: string;
}

interface ThresholdsEditorProps {
  thresholds: PerformanceThreshold[];
  onChange: (thresholds: PerformanceThreshold[]) => void;
}

const ThresholdsEditor: React.FC<ThresholdsEditorProps> = ({ thresholds, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [currentHtmlEdit, setCurrentHtmlEdit] = useState({ id: '', html: '' });

  const addThreshold = () => {
    const newThreshold: PerformanceThreshold = {
      id: `threshold-${Date.now()}`,
      name: 'Nuevo Rango',
      minPercentage: 0,
      maxPercentage: 100,
      color: '#94a3b8',
      messageHtml: '<p>Mensaje para este rango de desempeño.</p>'
    };
    onChange([...thresholds, newThreshold]);
  };

  const removeThreshold = (id: string) => {
    onChange(thresholds.filter(t => t.id !== id));
  };

  const updateThreshold = (id: string, updates: Partial<PerformanceThreshold>) => {
    onChange(thresholds.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const moveThreshold = (index: number, direction: 'up' | 'down') => {
    const newThresholds = [...thresholds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newThresholds.length) return;
    
    [newThresholds[index], newThresholds[targetIndex]] = 
    [newThresholds[targetIndex], newThresholds[index]];
    
    onChange(newThresholds);
  };

  const openHtmlEditor = (id: string, currentHtml: string) => {
    setCurrentHtmlEdit({ id, html: currentHtml });
    setShowHtmlEditor(true);
  };

  const saveHtmlEdit = () => {
    updateThreshold(currentHtmlEdit.id, { messageHtml: currentHtmlEdit.html });
    setShowHtmlEditor(false);
    setCurrentHtmlEdit({ id: '', html: '' });
  };

  const validateThresholds = () => {
    const errors: string[] = [];
    
    // Check for overlapping ranges
    for (let i = 0; i < thresholds.length; i++) {
      for (let j = i + 1; j < thresholds.length; j++) {
        const t1 = thresholds[i];
        const t2 = thresholds[j];
        
        if (
          (t1.minPercentage <= t2.maxPercentage && t1.maxPercentage >= t2.minPercentage) ||
          (t2.minPercentage <= t1.maxPercentage && t2.maxPercentage >= t1.minPercentage)
        ) {
          errors.push(`Los rangos "${t1.name}" y "${t2.name}" se superponen`);
        }
      }
    }
    
    return errors;
  };

  const errors = validateThresholds();
  const sortedThresholds = [...thresholds].sort((a, b) => b.minPercentage - a.minPercentage);

  const presetColors = [
    { name: 'Excelente', color: '#10b981' },
    { name: 'Bueno', color: '#3b82f6' },
    { name: 'Aceptable', color: '#f59e0b' },
    { name: 'Bajo', color: '#ef4444' },
    { name: 'Gris', color: '#94a3b8' },
    { name: 'Púrpura', color: '#8b5cf6' },
  ];

  return (
    <div className={styles.settingsSection}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Umbrales de Desempeño</h3>
        <button
          type="button"
          onClick={addThreshold}
          className={styles.addButton}
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#6969bc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          <Plus size={16} />
          Agregar Rango
        </button>
      </div>

      {errors.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', marginBottom: '0.5rem' }}>
            <AlertCircle size={18} />
            <strong>Errores de Validación</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#991b1b' }}>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {thresholds.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f8fafc',
          borderRadius: '8px',
          color: '#64748b'
        }}>
          <p>No hay rangos definidos. Haz clic en "Agregar Rango" para crear uno.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedThresholds.map((threshold, index) => (
          <div
            key={threshold.id}
            style={{
              background: 'white',
              border: `2px solid ${threshold.color}`,
              borderRadius: '8px',
              padding: '1rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => moveThreshold(sortedThresholds.indexOf(threshold), 'up')}
                disabled={index === 0}
                style={{
                  padding: '0.25rem',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  opacity: index === 0 ? 0.5 : 1
                }}
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => moveThreshold(sortedThresholds.indexOf(threshold), 'down')}
                disabled={index === sortedThresholds.length - 1}
                style={{
                  padding: '0.25rem',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  cursor: index === sortedThresholds.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: index === sortedThresholds.length - 1 ? 0.5 : 1
                }}
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => removeThreshold(threshold.id)}
                style={{
                  padding: '0.25rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#dc2626',
                  marginLeft: 'auto'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Nombre del Rango
                </label>
                <input
                  type="text"
                  value={threshold.name}
                  onChange={(e) => updateThreshold(threshold.id, { name: e.target.value })}
                  className={styles.input}
                  placeholder="Ej: Excelente, Bueno, Necesita Mejorar"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={threshold.color}
                    onChange={(e) => updateThreshold(threshold.id, { color: e.target.value })}
                    style={{ width: '50px', height: '38px', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                  />
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', flex: 1 }}>
                    {presetColors.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => updateThreshold(threshold.id, { color: preset.color })}
                        style={{
                          width: '24px',
                          height: '24px',
                          background: preset.color,
                          border: threshold.color === preset.color ? '2px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Porcentaje Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={threshold.minPercentage}
                  onChange={(e) => updateThreshold(threshold.id, { minPercentage: parseFloat(e.target.value) || 0 })}
                  className={styles.input}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Porcentaje Máximo
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={threshold.maxPercentage}
                  onChange={(e) => updateThreshold(threshold.id, { maxPercentage: parseFloat(e.target.value) || 0 })}
                  className={styles.input}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Mensaje HTML
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => openHtmlEditor(threshold.id, threshold.messageHtml)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {threshold.messageHtml || 'Haz clic para editar el mensaje...'}
                </button>
              </div>
              
              {threshold.messageHtml && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                    Vista Previa:
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: threshold.messageHtml }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* HTML Editor Modal */}
      {showHtmlEditor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>Editor de Mensaje HTML</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Código HTML
              </label>
              <textarea
                value={currentHtmlEdit.html}
                onChange={(e) => setCurrentHtmlEdit({ ...currentHtmlEdit, html: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
                placeholder="<p>Escribe tu mensaje aquí...</p>"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Vista Previa
              </label>
              <div style={{
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                background: '#f8fafc',
                minHeight: '100px'
              }}>
                <div dangerouslySetInnerHTML={{ __html: currentHtmlEdit.html }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowHtmlEditor(false);
                  setCurrentHtmlEdit({ id: '', html: '' });
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveHtmlEdit}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6969bc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThresholdsEditor;
