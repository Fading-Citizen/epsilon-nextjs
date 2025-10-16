"use client";

import React, { useState } from 'react';
import { useTheme } from '../../themes/ThemeContext';
import styles from './EvaluationsManager.module.css';
import {
  Award,
  FileText,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  Play,
  Copy,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Target
} from 'lucide-react';

interface Evaluation {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'exam' | 'simulacro';
  course: string;
  status: 'draft' | 'active' | 'finished' | 'archived';
  timeLimit: number; // minutos
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

interface EvaluationsManagerProps {
  viewMode: 'cards' | 'list';
  filters: {
    search: string;
    type: string;
    status: string;
    course: string;
    sortBy: string;
  };
  onEditEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsManager: React.FC<EvaluationsManagerProps> = ({ viewMode, filters, onEditEvaluation }) => {
  // Trigger theme so CSS custom properties are in place
  useTheme();

  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: '1',
      title: 'Quiz: Derivadas e Integrales',
      description: 'Evaluación sobre conceptos básicos de derivadas e integrales',
      type: 'quiz',
      course: 'Cálculo Diferencial',
      status: 'active',
      timeLimit: 45,
      questions: 15,
      maxAttempts: 2,
      passingScore: 70,
      createdDate: new Date('2024-11-15'),
      dueDate: new Date('2024-12-15'),
      publishDate: new Date('2024-11-20'),
      totalResponses: 28,
      averageScore: 82,
      passRate: 85,
      difficulty: 'medium'
    },
    {
      id: '2',
      title: 'Examen Final: Física Cuántica',
      description: 'Examen comprehensivo sobre todos los temas del curso',
      type: 'exam',
      course: 'Física Cuántica',
      status: 'active',
      timeLimit: 120,
      questions: 40,
      maxAttempts: 1,
      passingScore: 60,
      createdDate: new Date('2024-10-20'),
      dueDate: new Date('2024-12-20'),
      publishDate: new Date('2024-11-01'),
      totalResponses: 15,
      averageScore: 78,
      passRate: 80,
      difficulty: 'hard'
    },
    {
      id: '3',
      title: 'Simulacro ICFES Matemáticas',
      description: 'Simulacro tipo ICFES para preparación de examen de estado',
      type: 'simulacro',
      course: 'Preparación ICFES',
      status: 'draft',
      timeLimit: 90,
      questions: 25,
      maxAttempts: 3,
      passingScore: 50,
      createdDate: new Date('2024-12-01'),
      totalResponses: 0,
      averageScore: 0,
      passRate: 0,
      difficulty: 'medium'
    },
    {
      id: '4',
      title: 'Quiz: Variables y Funciones',
      description: 'Evaluación básica sobre programación en Python',
      type: 'quiz',
      course: 'Programación Python',
      status: 'finished',
      timeLimit: 30,
      questions: 10,
      maxAttempts: 2,
      passingScore: 70,
      createdDate: new Date('2024-09-15'),
      dueDate: new Date('2024-10-15'),
      publishDate: new Date('2024-09-20'),
      totalResponses: 42,
      averageScore: 88,
      passRate: 95,
      difficulty: 'easy'
    },
    {
      id: '5',
      title: 'Examen Parcial: Química Orgánica',
      description: 'Evaluación de medio término sobre compuestos orgánicos',
      type: 'exam',
      course: 'Química Orgánica',
      status: 'archived',
      timeLimit: 90,
      questions: 30,
      maxAttempts: 1,
      passingScore: 65,
      createdDate: new Date('2024-08-10'),
      dueDate: new Date('2024-09-10'),
      publishDate: new Date('2024-08-15'),
      totalResponses: 35,
      averageScore: 74,
      passRate: 77,
      difficulty: 'medium'
    }
  ]);

  const filtered = evaluations.filter(e => {
    const s = filters.search.toLowerCase();
    return (
      (e.title.toLowerCase().includes(s) || e.description.toLowerCase().includes(s)) &&
      (filters.type === 'all' || e.type === filters.type) &&
      (filters.status === 'all' || e.status === filters.status) &&
      (filters.course === 'all' || e.course === filters.course)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name': return a.title.localeCompare(b.title);
      case 'date': return b.createdDate.getTime() - a.createdDate.getTime();
      case 'course': return a.course.localeCompare(b.course);
      case 'responses': return b.totalResponses - a.totalResponses;
      default: return 0;
    }
  });

  const removeEval = (id: string) => {
    if (window.confirm('¿Eliminar evaluación?')) setEvaluations(p => p.filter(e => e.id !== id));
  };
  const duplicate = (ev: Evaluation) => {
    const copy: Evaluation = { ...ev, id: Date.now().toString(), title: ev.title + ' (Copia)', status: 'draft', totalResponses:0, averageScore:0, passRate:0, createdDate:new Date(), publishDate:undefined, dueDate:undefined };
    setEvaluations(p => [copy, ...p]);
  };
  const changeStatus = (id: string, st: Evaluation['status']) => setEvaluations(p => p.map(e => e.id === id ? { ...e, status: st } : e));

  const statusColor = (s: Evaluation['status']) => ({active:'#10b981',draft:'#6b7280',finished:'#3b82f6',archived:'#8b5cf6'} as any)[s] || '#6b7280';
  const statusText = (s: Evaluation['status']) => ({active:'Activo',draft:'Borrador',finished:'Finalizado',archived:'Archivado'} as any)[s] || s;
  const typeColor = (t: Evaluation['type']) => ({quiz:'#f59e0b',exam:'#ef4444',simulacro:'#8b5cf6'} as any)[t] || '#6b7280';
  const typeText = (t: Evaluation['type']) => ({quiz:'Quiz',exam:'Examen',simulacro:'Simulacro'} as any)[t] || t;
  const diffColor = (d: Evaluation['difficulty']) => ({easy:'#10b981',medium:'#f59e0b',hard:'#ef4444'} as any)[d] || '#6b7280';
  const diffText = (d: Evaluation['difficulty']) => ({easy:'Fácil',medium:'Medio',hard:'Difícil'} as any)[d] || d;
  const fmt = (dt: Date) => dt.toLocaleDateString('es-ES',{year:'numeric',month:'short',day:'numeric'});
  const statusIcon = (s: Evaluation['status']) => { switch (s) { case 'active': return <Play size={14}/>; case 'draft': return <Edit size={14}/>; case 'finished': return <CheckCircle size={14}/>; case 'archived': return <XCircle size={14}/>; default: return <AlertCircle size={14}/>; } };

  const Card = ({ e }: { e: Evaluation }) => (
    <div className={styles.evaluationCard}>
      <div className={styles.evaluationHeader}>
        <div className={styles.badges}>
          <span className={styles.typeBadge} style={{ backgroundColor: typeColor(e.type) }}>{typeText(e.type)}</span>
          <span className={styles.statusBadge} style={{ backgroundColor: statusColor(e.status) }}>{statusIcon(e.status)} {statusText(e.status)}</span>
        </div>
        <div className={styles.menu}>
          <button className={styles.menuTrigger}>⋯</button>
          <div className={styles.menuDropdown}>
            <button onClick={()=>onEditEvaluation(e)}><Edit size={14}/>Editar</button>
            <button onClick={()=>duplicate(e)}><Copy size={14}/>Duplicar</button>
            <button onClick={()=>console.log('Estadísticas')}><BarChart3 size={14}/>Estadísticas</button>
            <button onClick={()=>console.log('Exportar')}><Download size={14}/>Exportar</button>
            <hr />
            <button onClick={()=>changeStatus(e.id,'active')}><Play size={14}/>Activar</button>
            <button onClick={()=>changeStatus(e.id,'archived')}><XCircle size={14}/>Archivar</button>
            <button onClick={()=>removeEval(e.id)} className="danger"><Trash2 size={14}/>Eliminar</button>
          </div>
        </div>
      </div>
      <div className={styles.evaluationContent}>
        <h3>{e.title}</h3>
        <p className={styles.description}>{e.description}</p>
        <div className={styles.meta}>
          <span className={styles.courseName}>{e.course}</span>
          <span className={styles.difficulty} style={{ color: diffColor(e.difficulty) }}>{diffText(e.difficulty)}</span>
        </div>
        <div className={styles.details}>
          <div className={styles.detailItem}><Clock size={12}/> {e.timeLimit} min</div>
          <div className={styles.detailItem}><FileText size={12}/> {e.questions} preguntas</div>
          <div className={styles.detailItem}><Target size={12}/> {e.passingScore}% mínimo</div>
          <div className={styles.detailItem}><Users size={12}/> {e.totalResponses} respuestas</div>
        </div>
        {e.totalResponses > 0 && (
          <div className={styles.stats}>
            <div className={styles.stat}><span className={styles.statLabel}>Promedio</span><span className={styles.statValue}>{e.averageScore}%</span></div>
            <div className={styles.stat}><span className={styles.statLabel}>Aprobación</span><span className={styles.statValue}>{e.passRate}%</span></div>
          </div>
        )}
        <div className={styles.dates}>
          <div className={styles.dateItem}><Calendar size={12}/> Creado: {fmt(e.createdDate)}</div>
          {e.dueDate && <div className={styles.dateItem}><Clock size={12}/> Vence: {fmt(e.dueDate)}</div>}
        </div>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={()=>onEditEvaluation(e)}><Edit size={14}/>Editar</button>
        <button className={`${styles.actionBtn} ${styles.secondaryBtn}`} onClick={()=>console.log('Resultados')}><Eye size={14}/>Resultados</button>
      </div>
    </div>
  );

  const Row = ({ e }: { e: Evaluation }) => (
    <div className={styles.listItem}>
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h4>{e.title}</h4>
          <div className={styles.badgesSm}>
            <span className={styles.typeSm} style={{ backgroundColor: typeColor(e.type) }}>{typeText(e.type)}</span>
            <span className={styles.difficultySm} style={{ color: diffColor(e.difficulty) }}>{diffText(e.difficulty)}</span>
          </div>
        </div>
        <p className={styles.course}>{e.course}</p>
      </div>
      <div className={styles.detailsList}>
        <span>{e.questions} preguntas</span>
        <span>{e.timeLimit} min</span>
        <span>{e.totalResponses} respuestas</span>
      </div>
      <div className={styles.statsList}>
        {e.totalResponses > 0 ? (<><span>Promedio: {e.averageScore}%</span><span>Aprobación: {e.passRate}%</span></>) : <span>Sin respuestas</span>}
      </div>
      <div className={styles.statusCol}>
        <div className={styles.statusBadgeList} style={{ backgroundColor: statusColor(e.status) }}>{statusIcon(e.status)} {statusText(e.status)}</div>
        <small>{fmt(e.createdDate)}</small>
      </div>
      <div className={styles.actionIcons}>
        <button onClick={()=>onEditEvaluation(e)}><Edit size={14}/></button>
        <button onClick={()=>console.log('Resultados')}><Eye size={14}/></button>
        <button onClick={()=>removeEval(e.id)} className="danger"><Trash2 size={14}/></button>
      </div>
    </div>
  );

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <Award size={64} />
        <h3>No se encontraron evaluaciones</h3>
        <p>No hay evaluaciones que coincidan con los filtros aplicados</p>
      </div>
    );
  }

  return (
    <div className={styles.evaluationsManager}>
      {viewMode === 'cards' ? (
        <div className={styles.evaluationsGrid}>
          {sorted.map(e => <Card key={e.id} e={e} />)}
        </div>
      ) : (
        <div className={styles.listWrapper}>
          <div className={styles.listHeader}>
            <div>Evaluación</div>
            <div>Detalles</div>
            <div>Estadísticas</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>
          {sorted.map(e => <Row key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
};

export default EvaluationsManager;
