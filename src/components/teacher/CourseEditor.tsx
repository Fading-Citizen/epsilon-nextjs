// Clean single implementation
"use client";

import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit, Upload, FileText, File, Video } from 'lucide-react';
import styles from './CourseEditor.module.css';

interface Lesson { id:string; title:string; type:'video'|'text'|'quiz'|'assignment'; content:string; duration?:number; order:number; }
interface Course { id?:string; title:string; description:string; category:string; status:'active'|'draft'|'archived'; image:string; lessons:Lesson[]; objectives:string[]; requirements:string[]; tags:string[]; price:number; duration:number; }
interface CourseEditorProps { course?:Course; onSave:(c:Course)=>void; onCancel:()=>void; }

const categories=[
  {value:'matematicas',label:'Matemáticas'},
  {value:'fisica',label:'Física'},
  {value:'programacion',label:'Programación'},
  {value:'quimica',label:'Química'},
  {value:'historia',label:'Historia'},
  {value:'literatura',label:'Literatura'}
];

const normalizeCourse = (c?: Course): Course => {
  const base: Course = {
    id: c?.id,
    title: '',
    description: '',
    category: '',
    status: 'draft',
    image: '',
    lessons: [],
    objectives: [''],
    requirements: [''],
    tags: [],
    price: 0,
    duration: 0
  };
  if (!c) return base;
  return {
    ...base,
    ...c,
    // Ensure arrays are always defined and not null; keep at least one empty string for objectives/requirements UI
    lessons: Array.isArray(c.lessons) ? c.lessons : [],
    objectives: (Array.isArray(c.objectives) && c.objectives.length > 0) ? c.objectives : [''],
    requirements: (Array.isArray(c.requirements) && c.requirements.length > 0) ? c.requirements : [''],
    tags: Array.isArray(c.tags) ? c.tags : []
  };
};

const CourseEditor:React.FC<CourseEditorProps>=({course,onSave,onCancel})=>{
  const [activeTab,setActiveTab]=useState<'general'|'content'|'settings'>('general');
  const [editingLesson,setEditingLesson]=useState<Lesson|null>(null);
  const [formData,setFormData]=useState<Course>(normalizeCourse(course));
  const [newTag,setNewTag]=useState('');

  const update=(field:keyof Course,value:any)=>setFormData(p=>({...p,[field]:value}));
  const updateArr=(field:'objectives'|'requirements',i:number,val:string)=>{const arr=[...formData[field]];arr[i]=val;update(field,arr)};
  const addArr=(field:'objectives'|'requirements')=>update(field,[...formData[field],'']);
  const removeArr=(field:'objectives'|'requirements',i:number)=>update(field,formData[field].filter((_,idx)=>idx!==i));
  const addTag=()=>{const tag=newTag.trim(); if(tag && !formData.tags.includes(tag)){update('tags',[...formData.tags,tag]); setNewTag('');}};
  const removeTag=(tag:string)=>update('tags',formData.tags.filter(t=>t!==tag));
  const createLesson=(type:Lesson['type'])=>setEditingLesson({id:Date.now().toString(),title:'Nueva lección',type,content:'',order:formData.lessons.length+1});
  const saveLesson=(lesson:Lesson)=>{const exists=formData.lessons.some(l=>l.id===lesson.id); const lessons=exists?formData.lessons.map(l=>l.id===lesson.id?lesson:l):[...formData.lessons,lesson]; lessons.forEach((l,i)=>l.order=i+1); update('lessons',lessons); setEditingLesson(null);};
  const deleteLesson=(id:string)=>update('lessons',formData.lessons.filter(l=>l.id!==id));

  const LessonEditor=({lesson}:{lesson:Lesson})=> (
    <div className={styles.lessonEditor}>
      <div className={styles.lessonEditorHeader}>
        <h3>Editar Lección</h3>
        <div className={styles.lessonEditorActions}>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={()=>setEditingLesson(null)}>Cancelar</button>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={()=>saveLesson(lesson)}>Guardar</button>
        </div>
      </div>
      <div className={styles.lessonForm}>
        <div className={styles.formGroup}>
          <label>Título de la lección</label>
          <input value={lesson.title} onChange={e=>setEditingLesson({...lesson,title:e.target.value})} placeholder='Título de la lección'/>
        </div>
        <div className={styles.formGroup}>
          <label>Tipo de contenido</label>
            <select value={lesson.type} onChange={e=>setEditingLesson({...lesson,type:e.target.value as Lesson['type']})}>
              <option value='video'>Video</option>
              <option value='text'>Texto</option>
              <option value='quiz'>Quiz</option>
              <option value='assignment'>Tarea</option>
            </select>
        </div>
        {lesson.type==='video' && <div className={styles.formGroup}><label>URL del video</label><input value={lesson.content} onChange={e=>setEditingLesson({...lesson,content:e.target.value})} placeholder='https://...'/></div>}
        {lesson.type==='text' && <div className={styles.formGroup}><label>Contenido del texto</label><textarea rows={8} value={lesson.content} onChange={e=>setEditingLesson({...lesson,content:e.target.value})} placeholder='Contenido de la lección...'/></div>}
        {lesson.type==='quiz' && <div className={styles.formGroup}><label>ID del Quiz</label><input value={lesson.content} onChange={e=>setEditingLesson({...lesson,content:e.target.value})} placeholder='ID del quiz asociado'/></div>}
        {lesson.type==='assignment' && <div className={styles.formGroup}><label>Descripción de la tarea</label><textarea rows={5} value={lesson.content} onChange={e=>setEditingLesson({...lesson,content:e.target.value})} placeholder='Descripción de la tarea...'/></div>}
        {lesson.type==='video' && <div className={styles.formGroup}><label>Duración (minutos)</label><input type='number' value={lesson.duration||''} onChange={e=>setEditingLesson({...lesson,duration:parseInt(e.target.value)||0})} placeholder='0'/></div>}
      </div>
    </div>
  );

  return (
    <div className={styles.courseEditor}>
      <div className={styles.editorHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onCancel}><ArrowLeft size={18}/> Volver</button>
          <div className={styles.headerTitle}>
            <h1>{course?'Editar Curso':'Crear Nuevo Curso'}</h1>
            <p>{course?`Editando: ${course.title}`:'Completa la información del curso'}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={onCancel}>Cancelar</button>
          <button className={`${styles.actionBtn} ${styles.primary}`} onClick={()=>onSave(formData)}><Save size={18}/> Guardar Curso</button>
        </div>
      </div>

      <div className={styles.editorTabs}>
        <button className={`${styles.tab} ${activeTab==='general'?styles.active:''}`} onClick={()=>setActiveTab('general')}>Información General</button>
        <button className={`${styles.tab} ${activeTab==='content'?styles.active:''}`} onClick={()=>setActiveTab('content')}>Contenido y Lecciones</button>
        <button className={`${styles.tab} ${activeTab==='settings'?styles.active:''}`} onClick={()=>setActiveTab('settings')}>Configuración</button>
      </div>

      <div className={styles.editorContent}>
        {activeTab==='general' && (
          <div className={styles.tabContent}>
            <div className={styles.formSections}>
              <div className={styles.formSection}>
                <h3>Información Básica</h3>
                <div className={styles.formGroup}><label>Título del curso *</label><input value={formData.title} onChange={e=>update('title',e.target.value)} placeholder='Ej: Cálculo Diferencial' required/></div>
                <div className={styles.formGroup}><label>Descripción *</label><textarea rows={4} value={formData.description} onChange={e=>update('description',e.target.value)} placeholder='Describe de qué trata el curso...' required/></div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}><label>Categoría *</label><select value={formData.category} onChange={e=>update('category',e.target.value)} required><option value=''>Selecciona una categoría</option>{categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  <div className={styles.formGroup}><label>Estado</label><select value={formData.status} onChange={e=>update('status',e.target.value)}><option value='draft'>Borrador</option><option value='active'>Activo</option><option value='archived'>Archivado</option></select></div>
                </div>
                <div className={styles.formGroup}><label>Imagen del curso</label><div className={styles.imageUpload}><input value={formData.image} onChange={e=>update('image',e.target.value)} placeholder='URL de la imagen o sube una imagen'/><button type='button' className={styles.uploadBtn}><Upload size={14}/> Subir</button></div>{formData.image && <div className={styles.imagePreview}><img src={formData.image} alt='Preview'/></div>}</div>
              </div>
              <div className={styles.formSection}>
                <h3>Objetivos del Curso</h3><p>¿Qué aprenderán los estudiantes?</p>
                {formData.objectives.map((o,i)=>(<div key={i} className={styles.arrayItem}><input value={o} onChange={e=>updateArr('objectives',i,e.target.value)} placeholder='Objetivo del curso...'/><button type='button' className={styles.removeBtn} onClick={()=>removeArr('objectives',i)}><Trash2 size={14}/></button></div>))}
                <button type='button' className={styles.addBtn} onClick={()=>addArr('objectives')}><Plus size={14}/> Agregar objetivo</button>
              </div>
              <div className={styles.formSection}>
                <h3>Requisitos</h3><p>¿Qué necesitan saber los estudiantes antes?</p>
                {formData.requirements.map((r,i)=>(<div key={i} className={styles.arrayItem}><input value={r} onChange={e=>updateArr('requirements',i,e.target.value)} placeholder='Requisito...'/><button type='button' className={styles.removeBtn} onClick={()=>removeArr('requirements',i)}><Trash2 size={14}/></button></div>))}
                <button type='button' className={styles.addBtn} onClick={()=>addArr('requirements')}><Plus size={14}/> Agregar requisito</button>
              </div>
              <div className={styles.formSection}>
                <h3>Etiquetas</h3><p>Ayuda a los estudiantes a encontrar tu curso</p>
                <div className={styles.tagsInput}><input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder='Escribe una etiqueta...' onKeyDown={e=>e.key==='Enter' && (e.preventDefault(),addTag())}/><button type='button' onClick={addTag}>Agregar</button></div>
                <div className={styles.tagsList}>{formData.tags.map(t=><span key={t} className={styles.tag}>{t}<button type='button' onClick={()=>removeTag(t)}>×</button></span>)}</div>
              </div>
            </div>
          </div>
        )}
        {activeTab==='content' && (
          <div className={styles.tabContent}>
            {editingLesson? <LessonEditor lesson={editingLesson}/> : (
              <div className={styles.contentSection}>
                <div className={styles.contentHeader}>
                  <h3>Lecciones del Curso</h3>
                  <div className={styles.contentActions}>
                    <button type='button' className={`${styles.actionBtn} ${styles.primary}`} onClick={()=>createLesson('video')}><Video size={14}/> Video</button>
                    <button type='button' className={`${styles.actionBtn} ${styles.secondary}`} onClick={()=>createLesson('text')}><FileText size={14}/> Texto</button>
                    <button type='button' className={`${styles.actionBtn} ${styles.secondary}`} onClick={()=>createLesson('quiz')}><File size={14}/> Quiz</button>
                    <button type='button' className={`${styles.actionBtn} ${styles.secondary}`} onClick={()=>createLesson('assignment')}><Edit size={14}/> Tarea</button>
                  </div>
                </div>
                <div className={styles.lessonsList}>
                  {formData.lessons.length===0? (
                    <div className={styles.emptyLessons}>
                      <FileText size={48}/>
                      <h4>No hay lecciones aún</h4>
                      <p>Agrega contenido usando los botones de arriba</p>
                    </div>
                  ) : (
                    formData.lessons.map(l=>(
                      <div key={l.id} className={styles.lessonItem}>
                        <div className={styles.lessonInfo}>
                          <div className={styles.lessonType}><span>{l.type}</span></div>
                          <div className={styles.lessonDetails}><h4>{l.title}</h4><p>Lección {l.order}</p></div>
                        </div>
                        <div className={styles.lessonActions}>
                          <button type='button' onClick={()=>setEditingLesson(l)}><Edit size={14}/></button>
                          <button type='button' onClick={()=>deleteLesson(l.id)}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab==='settings' && (
          <div className={styles.tabContent}>
            <div className={styles.formSections}>
              <div className={styles.formSection}>
                <h3>Configuración del Curso</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}><label>Precio (USD)</label><input type='number' value={formData.price} onChange={e=>update('price',parseFloat(e.target.value)||0)} placeholder='0.00'/></div>
                  <div className={styles.formGroup}><label>Duración estimada (horas)</label><input type='number' value={formData.duration} onChange={e=>update('duration',parseInt(e.target.value)||0)} placeholder='0'/></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
