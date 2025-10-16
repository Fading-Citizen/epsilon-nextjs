"use client";

import React from 'react';

import { createClient } from '@/lib/supabase/client';
import { Plus, Users, UserPlus, X, RefreshCw, Link2, Server, Database, Shield, Trash2, Power, Package } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import ServicesManager from './ServicesManager';

interface Profile {
	id: string;
	full_name: string | null;
	email: string | null;
	role: 'admin' | 'teacher' | 'student';
	teacher_id?: string | null; // para estudiantes asignados
}

interface SystemStatusMetric {
	id: string; label: string; value: string; icon: React.ReactNode; color: string; desc?: string;
}

const translations: Record<string, Record<string,string>> = {
	es: {
		dashboard:'Dashboard', teachers:'Profesores', students:'Estudiantes', assignments:'Asignaciones', courses:'Cursos', courses_active:'Cursos Activos', active:'Activo',
		new_teacher:'Nuevo Profesor', new_student:'Nuevo Estudiante', name:'Nombre', assigned_students:'Estudiantes asignados', actions:'Acciones', deactivate:'Desactivar', delete:'Eliminar', no_teachers:'Sin profesores', no_students:'Sin estudiantes', unassigned:'No asignado', assign:'Asignar', teacher:'Profesor', full_name:'Nombre completo', optional_teacher:'-- Profesor opcional --', cancel:'Cancelar', create:'Crear', assign_teacher:'Asignar Profesor', student:'Estudiante', no_teacher:'-- Sin profesor --', close:'Cerrar', teacher_student_relations:'Relaciones Profesor ↔ Estudiante', relations_summary:'Resumen de asignaciones actuales.', refresh:'Actualizar', refreshing:'Actualizando...', confirm_deactivate_teacher:'¿Desactivar profesor?', confirm_delete_teacher:'¿Eliminar profesor definitivamente?', confirm_deactivate_student:'¿Desactivar estudiante?', confirm_delete_student:'¿Eliminar estudiante definitivamente?' },
	en: {
		dashboard:'Dashboard', teachers:'Teachers', students:'Students', assignments:'Assignments', courses:'Courses', courses_active:'Active Courses', active:'Active',
		new_teacher:'New Teacher', new_student:'New Student', name:'Name', assigned_students:'Assigned Students', actions:'Actions', deactivate:'Deactivate', delete:'Delete', no_teachers:'No teachers', no_students:'No students', unassigned:'Unassigned', assign:'Assign', teacher:'Teacher', full_name:'Full name', optional_teacher:'-- Optional teacher --', cancel:'Cancel', create:'Create', assign_teacher:'Assign Teacher', student:'Student', no_teacher:'-- No teacher --', close:'Close', teacher_student_relations:'Teacher ↔ Student Relations', relations_summary:'Summary of current assignments.', refresh:'Refresh', refreshing:'Refreshing...', confirm_deactivate_teacher:'Deactivate teacher?', confirm_delete_teacher:'Delete teacher permanently?', confirm_deactivate_student:'Deactivate student?', confirm_delete_student:'Delete student permanently?' }
};

const Pagination: React.FC<{page:number,total:number,onChange:(p:number)=>void}> = ({page,total,onChange}) => {
  if(total<=1) return null;
  return <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16}}>
    <button disabled={page===1} onClick={()=>onChange(page-1)} style={{...styles.secondaryBtn,opacity:page===1?0.5:1,color:'#374151'}}>{'<'}</button>
    <span style={{fontSize:13,alignSelf:'center',color:'#374151'}}>{page} / {total}</span>
    <button disabled={page===total} onClick={()=>onChange(page+1)} style={{...styles.secondaryBtn,opacity:page===total?0.5:1,color:'#374151'}}>{'>'}</button>
  </div>;
};const AdminPanel: React.FC = () => {
	const supabase = createClient();
	const [loading, setLoading] = React.useState(false);
	const [teachers, setTeachers] = React.useState<Profile[]>([]);
	const [students, setStudents] = React.useState<Profile[]>([]);
	const [assigningStudent, setAssigningStudent] = React.useState<Profile | null>(null);
	const [showTeacherModal, setShowTeacherModal] = React.useState(false);
	const [showStudentModal, setShowStudentModal] = React.useState(false);
	const [newTeacher, setNewTeacher] = React.useState({ name: '', email: '' });
	const [newStudent, setNewStudent] = React.useState({ name: '', email: '', teacher_id: '' });
	const [error, setError] = React.useState<string | null>(null);
		const [activeTab, setActiveTab] = React.useState<'dashboard'|'teachers'|'students'|'assignments'|'services'>('dashboard');
		const [locale] = React.useState<'es'|'en'>('es');
		const t = (k:string) => translations[locale][k] || k;
		const [teacherPage, setTeacherPage] = React.useState(1);
		const [studentPage, setStudentPage] = React.useState(1);
		const pageSize = 10;
		const teacherTotalPages = Math.max(1, Math.ceil(teachers.length / pageSize));
		const studentTotalPages = Math.max(1, Math.ceil(students.length / pageSize));
		const paginatedTeachers = teachers.slice((teacherPage-1)*pageSize, teacherPage*pageSize);
		const paginatedStudents = students.slice((studentPage-1)*pageSize, studentPage*pageSize);
	const [systemMetrics, setSystemMetrics] = React.useState<SystemStatusMetric[]>([]);

	// CSS override for dark mode
	React.useEffect(() => {
		const style = document.createElement('style');
		style.textContent = `
			.admin-panel-override {
				background-color: #ffffff !important;
				color: #111827 !important;
			}
			.admin-panel-override * {
				color: inherit !important;
			}
			.admin-panel-override button {
				color: inherit !important;
			}
			.admin-panel-override input, .admin-panel-override select {
				color: #111827 !important;
				background-color: #ffffff !important;
			}
		`;
		document.head.appendChild(style);
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Cargar perfiles
		const load = React.useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const { data: teacherData, error: tErr } = await supabase.from('profiles').select('id,full_name,email,role').eq('role','teacher').order('full_name');
			if (tErr) throw tErr;
				const { data: studentData, error: sErr } = await supabase.from('profiles').select('id,full_name,email,role,teacher_id').eq('role','student').order('full_name');
			if (sErr) throw sErr;
			setTeachers(teacherData as any || []);
			setStudents(studentData as any || []);
				// Aggregate metrics (placeholder queries - adapt as real tables unify)
				// Example: total courses, active courses if courses table exists
				const coursesAgg = await supabase.from('courses').select('id,status');
				const totalCourses = (coursesAgg.data || []).length;
				const activeCourses = (coursesAgg.data || []).filter(c=> (c as any).status==='published').length;
				setSystemMetrics(prev => prev.map(m => m.id==='courses' ? {...m, value: String(totalCourses)} : m.id==='courses_active' ? {...m,value:String(activeCourses)} : m));
		} catch (e:any) {
			setError(e.message || 'Error cargando datos');
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	React.useEffect(() => { load(); }, [load]);

	// Métricas simples (placeholder + conteos reales)
	React.useEffect(() => {
			setSystemMetrics([
				{ id: 'teachers', label: t('teachers'), value: String(teachers.length), icon: <Users size={18} />, color: '#2563eb' },
				{ id: 'students', label: t('students'), value: String(students.length), icon: <Users size={18} />, color: '#10b981' },
				{ id: 'relations', label: t('assignments'), value: String(students.filter(s=>s.teacher_id).length), icon: <Link2 size={18} />, color: '#f59e0b' },
				{ id: 'courses', label: t('courses'), value: '0', icon: <Database size={18} />, color: '#6366f1' },
				{ id: 'courses_active', label: t('courses_active'), value: '0', icon: <Server size={18} />, color: '#0ea5e9' },
				{ id: 'rls', label: 'RLS', value: t('active'), icon: <Shield size={18} />, color: '#ef4444' }
			]);
	}, [teachers, students]);

	async function createTeacher(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); setError(null);
		try {
			const { error: insertErr } = await supabase.from('profiles').insert({ id: uuid(), full_name: newTeacher.name, email: newTeacher.email, role: 'teacher' });
			if (insertErr) throw insertErr;
			setShowTeacherModal(false); setNewTeacher({ name:'', email:'' });
			await load();
		} catch (e:any) { setError(e.message); } finally { setLoading(false); }
	}

	async function createStudent(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true); setError(null);
		try {
			const { error: insertErr } = await supabase.from('profiles').insert({ id: uuid(), full_name: newStudent.name, email: newStudent.email, role: 'student', teacher_id: newStudent.teacher_id || null });
			if (insertErr) throw insertErr;
			setShowStudentModal(false); setNewStudent({ name:'', email:'', teacher_id:'' });
			await load();
		} catch (e:any) { setError(e.message); } finally { setLoading(false); }
	}

	async function assignStudent(studentId: string, teacherId: string | null) {
		setLoading(true); setError(null);
		try {
			const { error: updErr } = await supabase.from('profiles').update({ teacher_id: teacherId }).eq('id', studentId);
			if (updErr) throw updErr;
			setAssigningStudent(null);
			await load();
		} catch(e:any) { setError(e.message); } finally { setLoading(false); }
	}

  const TabButton = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button onClick={()=>setActiveTab(id)} style={{
      padding:'0.75rem 1.25rem',
      border:'none',
      background: activeTab===id ? 'linear-gradient(90deg,#ff9800,#f57c00)' : 'rgba(0,0,0,0.05)',
      color: activeTab===id? '#fff':'#374151',
      borderRadius: 30,
      fontWeight:600,
      cursor:'pointer'
    }}>{label}</button>
  );	function renderDashboard() {
		return (
			<div>
				<h1 style={styles.heading}>Panel de Administración</h1>
				<p style={styles.subtitle}>Controla usuarios, relaciones y estado del sistema.</p>
				{error && <div style={styles.error}>{error}</div>}
				<div style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',marginTop:24}}>
					{systemMetrics.map(m => (
						<div key={m.id} style={{background:'#fff',borderRadius:14,padding:'1rem 1.25rem',boxShadow:'0 4px 12px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',gap:4,border:`1px solid ${m.color}22`}}>
							<div style={{display:'flex',alignItems:'center',gap:8,color:m.color,fontWeight:600}}>{m.icon}{m.label}</div>
							<div style={{fontSize:'1.75rem',fontWeight:700,color:'#111'}}>{m.value}</div>
							{m.desc && <div style={{fontSize:12,color:'#555'}}>{m.desc}</div>}
						</div>
					))}
				</div>
			</div>
		);
	}

		async function deactivateTeacher(id:string) {
			if(!confirm(t('confirm_deactivate_teacher'))) return;
			setLoading(true); setError(null);
			try {
				const { error: updErr } = await supabase.from('profiles').update({ is_active: false }).eq('id', id);
				if (updErr) throw updErr;
				await load();
			} catch(e:any){ setError(e.message);} finally { setLoading(false);}  
		}
		async function deleteTeacher(id:string) {
			if(!confirm(t('confirm_delete_teacher'))) return;
			setLoading(true); setError(null);
			try {
				const { error: delErr } = await supabase.from('profiles').delete().eq('id', id);
				if (delErr) throw delErr;
				await load();
			} catch(e:any){ setError(e.message);} finally { setLoading(false);}  
		}
		function renderTeachers() {
		return (
			<div>
				<div style={styles.sectionHeader}>
						<h2 style={{margin:0}}>{t('teachers')}</h2>
						<button onClick={()=>setShowTeacherModal(true)} style={styles.primaryBtn}><Plus size={16}/> {t('new_teacher')}</button>
				</div>
				<table style={styles.table}> 
						<thead><tr><th>{t('name')}</th><th>Email</th><th>{t('assigned_students')}</th><th>{t('actions')}</th></tr></thead>
					<tbody>
										{paginatedTeachers.map(prof => {
											const count = students.filter(s=>s.teacher_id===prof.id).length;
											return <tr key={prof.id}><td>{prof.full_name || '—'}</td><td>{prof.email||'—'}</td><td>{count}</td><td style={{display:'flex',gap:8}}>
												<button title={t('deactivate')} onClick={()=>deactivateTeacher(prof.id)} style={styles.iconSmallBtn}><Power size={14}/></button>
												<button title={t('delete')} onClick={()=>deleteTeacher(prof.id)} style={styles.iconDangerBtn}><Trash2 size={14}/></button>
								</td></tr>;
						})}
							{!teachers.length && <tr><td colSpan={4} style={{textAlign:'center',padding:24}}>{t('no_teachers')}</td></tr>}
					</tbody>
				</table>
					<Pagination page={teacherPage} total={teacherTotalPages} onChange={setTeacherPage} />
			</div>
		);
	}

		async function deactivateStudent(id:string) {
			if(!confirm(t('confirm_deactivate_student'))) return;
			setLoading(true); setError(null);
			try {
				const { error: updErr } = await supabase.from('profiles').update({ is_active: false }).eq('id', id);
				if (updErr) throw updErr;
				await load();
			} catch(e:any){ setError(e.message);} finally { setLoading(false);}  
		}
		async function deleteStudent(id:string) {
			if(!confirm(t('confirm_delete_student'))) return;
			setLoading(true); setError(null);
			try {
				const { error: delErr } = await supabase.from('profiles').delete().eq('id', id);
				if (delErr) throw delErr;
				await load();
			} catch(e:any){ setError(e.message);} finally { setLoading(false);}  
		}
		function renderStudents() {
		return (
			<div>
				<div style={styles.sectionHeader}>
						<h2 style={{margin:0}}>{t('students')}</h2>
						<button onClick={()=>setShowStudentModal(true)} style={styles.primaryBtn}><UserPlus size={16}/> {t('new_student')}</button>
				</div>
				<table style={styles.table}> 
						<thead><tr><th>{t('name')}</th><th>Email</th><th>{t('teacher')}</th><th>{t('actions')}</th></tr></thead>
					<tbody>
										{paginatedStudents.map(stu => {
											const teacher = teachers.find(t=>t.id===stu.teacher_id);
											return <tr key={stu.id}><td>{stu.full_name||'—'}</td><td>{stu.email||'—'}</td><td>{teacher?.full_name||t('unassigned')}</td><td style={{display:'flex',gap:8}}>
												<button style={styles.linkBtn} onClick={()=>setAssigningStudent(stu)}>{t('assign')}</button>
												<button title={t('deactivate')} onClick={()=>deactivateStudent(stu.id)} style={styles.iconSmallBtn}><Power size={14}/></button>
												<button title={t('delete')} onClick={()=>deleteStudent(stu.id)} style={styles.iconDangerBtn}><Trash2 size={14}/></button>
								</td></tr>;
						})}
							{!students.length && <tr><td colSpan={4} style={{textAlign:'center',padding:24}}>{t('no_students')}</td></tr>}
					</tbody>
				</table>
					<Pagination page={studentPage} total={studentTotalPages} onChange={setStudentPage} />
			</div>
		);
	}

		function renderAssignments() {
		return (
			<div>
					<h2 style={{marginTop:0}}>{t('teacher_student_relations')}</h2>
					<p style={{color:'#555',marginTop:4}}>{t('relations_summary')}</p>
				<ul style={{paddingLeft:16,marginTop:16,lineHeight:1.5}}>
					{teachers.map(t => {
						const list = students.filter(s=>s.teacher_id===t.id);
						return <li key={t.id}><strong>{t.full_name||'—'}:</strong> {list.length? list.map(s=>s.full_name||'—').join(', ') : 'Sin estudiantes'}</li>;
					})}
					{!teachers.length && <li>No hay profesores</li>}
				</ul>
			</div>
		);
	}

	return (
		<div style={styles.wrapper} className="admin-panel-override">
			<div style={styles.container}>
					<div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
						<TabButton id='dashboard' label={t('dashboard')}/>
						<TabButton id='teachers' label={t('teachers')}/>
						<TabButton id='students' label={t('students')}/>
						<TabButton id='assignments' label={t('assignments')}/>
						<TabButton id='services' label='Servicios'/>
						<button onClick={load} style={{...styles.secondaryBtn, display:'flex',alignItems:'center',gap:6}} disabled={loading}><RefreshCw size={16} /> {loading? t('refreshing') : t('refresh')}</button>
			</div>
			{activeTab==='dashboard' && renderDashboard()}
			{activeTab==='teachers' && renderTeachers()}
			{activeTab==='students' && renderStudents()}
			{activeTab==='assignments' && renderAssignments()}
			{activeTab==='services' && <ServicesManager />}

			{/* Modal nuevo profesor */}
			{showTeacherModal && (
				<div style={styles.modalOverlay}>
					<div style={styles.modal}> 
						<div style={styles.modalHeader}><h3 style={{margin:0}}>{t('new_teacher')}</h3><button onClick={()=>setShowTeacherModal(false)} style={styles.iconBtn}><X size={18}/></button></div>
						<form onSubmit={createTeacher} style={{display:'flex',flexDirection:'column',gap:12}}>
							  <input required placeholder={t('full_name')} value={newTeacher.name} onChange={e=>setNewTeacher(v=>({...v,name:e.target.value}))} style={styles.input}/>
							  <input required type='email' placeholder='Email' value={newTeacher.email} onChange={e=>setNewTeacher(v=>({...v,email:e.target.value}))} style={styles.input}/>
							<div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
								<button type='button' onClick={()=>setShowTeacherModal(false)} style={styles.secondaryBtn}>{t('cancel')}</button>
								<button type='submit' style={styles.primaryBtn} disabled={loading}>{t('create')}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal nuevo estudiante */}
			{showStudentModal && (
				<div style={styles.modalOverlay}>
					<div style={styles.modal}> 
						<div style={styles.modalHeader}><h3 style={{margin:0}}>{t('new_student')}</h3><button onClick={()=>setShowStudentModal(false)} style={styles.iconBtn}><X size={18}/></button></div>
						<form onSubmit={createStudent} style={{display:'flex',flexDirection:'column',gap:12}}>
							  <input required placeholder={t('full_name')} value={newStudent.name} onChange={e=>setNewStudent(v=>({...v,name:e.target.value}))} style={styles.input}/>
							<input required type='email' placeholder='Email' value={newStudent.email} onChange={e=>setNewStudent(v=>({...v,email:e.target.value}))} style={styles.input}/>
											<select value={newStudent.teacher_id} onChange={e=>setNewStudent(v=>({...v,teacher_id:e.target.value}))} style={styles.input}>
												<option value=''>{t('optional_teacher')}</option>
								{teachers.map(t=> <option key={t.id} value={t.id}>{t.full_name||t.email}</option>)}
							</select>
							<div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
								<button type='button' onClick={()=>setShowStudentModal(false)} style={styles.secondaryBtn}>{t('cancel')}</button>
								<button type='submit' style={styles.primaryBtn} disabled={loading}>{t('create')}</button>
							</div>
						</form>
						<p style={{fontSize:12,color:'#666',marginTop:8}}>Los simulacros del estudiante son predefinidos: no se crean manualmente aquí.</p>
					</div>
				</div>
			)}

			{/* Modal asignar estudiante */}
			{assigningStudent && (
				<div style={styles.modalOverlay}>
					<div style={styles.modal}> 
									<div style={styles.modalHeader}><h3 style={{margin:0}}>{t('assign_teacher')}</h3><button onClick={()=>setAssigningStudent(null)} style={styles.iconBtn}><X size={18}/></button></div>
									<p style={{marginTop:0,fontSize:14}}>{t('student')}: <strong>{assigningStudent.full_name || assigningStudent.email}</strong></p>
						<div style={{display:'flex',flexDirection:'column',gap:12}}>
										<select value={assigningStudent.teacher_id||''} onChange={e=>assignStudent(assigningStudent.id,e.target.value||null)} style={styles.input}>
											<option value=''>{t('no_teacher')}</option>
								{teachers.map(t=> <option key={t.id} value={t.id}>{t.full_name||t.email}</option>)}
							</select>
							<div style={{display:'flex',justifyContent:'flex-end'}}>
											<button onClick={()=>setAssigningStudent(null)} style={styles.secondaryBtn}>{t('close')}</button>
							</div>
						</div>
					</div>
				</div>
			)}
			</div>
		</div>
	);
};

const styles: Record<string, React.CSSProperties> = {
	wrapper: {
		minHeight: '100vh',
		backgroundColor: '#ffffff',
		color: '#111827',
		fontFamily: 'system-ui, Arial, sans-serif'
	},
	container: {
		maxWidth: 960,
		margin: '40px auto',
		padding: '2rem',
		fontFamily: 'system-ui, Arial, sans-serif',
		background: 'linear-gradient(135deg,#ffffff,#f5f7fa)',
		borderRadius: 16,
		boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
		color: '#111827'
	},
	heading: {
		margin: 0,
		fontSize: '2rem',
		background: 'linear-gradient(90deg,#ff9800,#f57c00)',
		WebkitBackgroundClip: 'text',
		color: 'transparent' as any,
		fontWeight: 700
	},
	subtitle: {
		marginTop: 8,
		color: '#374151',
		fontSize: '0.95rem'
	},
	list: {marginTop: 24,lineHeight: 1.5,color: '#374151'},
	error: {marginTop:16,padding:'0.75rem 1rem',background:'#fee2e2',color:'#991b1b',border:'1px solid #fecaca',borderRadius:8,fontSize:14},
	sectionHeader: {display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,marginBottom:16},
	table: {width:'100%',borderCollapse:'collapse' as const,background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden',color:'#111827'},
	primaryBtn: {background:'linear-gradient(90deg,#ff9800,#f57c00)',color:'#fff',border:'none',padding:'0.55rem 1rem',borderRadius:8,cursor:'pointer',fontWeight:600,display:'inline-flex',alignItems:'center',gap:6},
	secondaryBtn: {background:'#f1f5f9',color:'#374151',border:'1px solid #cbd5e1',padding:'0.55rem 1rem',borderRadius:8,cursor:'pointer',fontWeight:500},
	linkBtn: {background:'none',border:'none',color:'#2563eb',cursor:'pointer',textDecoration:'underline',fontSize:13},
	modalOverlay: {position:'fixed' as const,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',padding:16,zIndex:1000},
	modal: {background:'#fff',padding:'1.5rem',borderRadius:16,width:'100%',maxWidth:420,boxShadow:'0 10px 30px -8px rgba(0,0,0,0.25)',position:'relative',color:'#111827'},
	modalHeader: {display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12},
	iconBtn: {background:'none',border:'none',cursor:'pointer',padding:4,display:'flex',alignItems:'center',color:'#6b7280'},
	input: {padding:'0.65rem 0.75rem',border:'1px solid #d1d5db',borderRadius:8,outline:'none',fontSize:14,width:'100%',color:'#111827',background:'#fff'},
	iconSmallBtn: {background:'#f1f5f9',border:'1px solid #cbd5e1',borderRadius:6,padding:4,cursor:'pointer',display:'inline-flex',alignItems:'center',color:'#374151'},
	iconDangerBtn: {background:'#fee2e2',border:'1px solid #fecaca',borderRadius:6,padding:4,cursor:'pointer',display:'inline-flex',alignItems:'center',color:'#b91c1c'},
	th: {padding:'0.75rem',textAlign:'left' as const,borderBottom:'1px solid #e5e7eb',background:'#f9fafb',fontWeight:600,color:'#374151'},
	td: {padding:'0.75rem',borderBottom:'1px solid #e5e7eb',color:'#111827'}
};

export default AdminPanel;

