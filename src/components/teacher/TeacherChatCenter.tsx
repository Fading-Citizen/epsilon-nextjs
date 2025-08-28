"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Search, Loader2, Shield } from 'lucide-react';
import StudentChat from '../student/StudentChat';
import { useTeachers } from '@/lib/hooks/useTeachers';

interface ChatThreadMeta {
  channel: string; // channel name (general or dm_teacher_student)
  last_message_at: string;
  last_message_preview: string;
  participants: string[]; // user ids
  student_name?: string; // nombre del estudiante si es DM
  unread?: number;
}

/**
 * Vista de chats para el profesor:
 * - Canal general
 * - Lista de estudiantes asignados al profesor para chat directo
 * - Solo muestra chats con estudiantes que tiene asignados
 * Requiere tabla messages con RLS que valide teacher_id en students
 */
export default function TeacherChatCenter({ teacherId }: { teacherId: string }) {
  const supabase = createClient();
  const [threads, setThreads] = useState<ChatThreadMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [search, setSearch] = useState('');
  const { teachers } = useTeachers(); // maybe used to map names

  const [assignedStudents, setAssignedStudents] = useState<{id: string, name: string, user_id: string}[]>([]);

  const loadThreads = useCallback(async () => {
    setLoading(true); setError(null);
    
    // Cargar estudiantes asignados primero
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('id, name, user_id')
      .eq('teacher_id', teacherId)
      .eq('status', 'active');
    
    if (studentsError) { 
      setError(studentsError.message); 
      setLoading(false); 
      return; 
    }
    
    const students = (studentsData || []).filter(s => s.user_id);
    setAssignedStudents(students);
    
    // Query mensajes de canales donde participa el profesor y general
    const { data, error } = await supabase
      .from('messages')
      .select('channel, content, created_at, sender_id')
      .or(`channel.eq.general,channel.like.dm_${teacherId}%`)
      .order('created_at', { ascending: false })
      .limit(400);
      
    if (error) { setError(error.message); setLoading(false); return; }
    
    const map = new Map<string, ChatThreadMeta>();
    
    // Agregar canal general siempre
    map.set('general', {
      channel: 'general',
      last_message_at: new Date().toISOString(),
      last_message_preview: 'Canal general de la academia',
      participants: [],
      unread: 0
    });
    
    // Procesar mensajes existentes
    (data || []).forEach(row => {
      const existing = map.get(row.channel);
      if (!existing || row.created_at > existing.last_message_at) {
        const participants = row.channel.startsWith('dm_') ? row.channel.replace('dm_','').split('_') : [];
        const studentUserId = participants.find((p: string) => p !== teacherId);
        const student = students.find(s => s.user_id === studentUserId);
        
        map.set(row.channel, {
          channel: row.channel,
          last_message_at: row.created_at,
          last_message_preview: row.content.slice(0, 60),
          participants,
          student_name: student?.name,
          unread: 0
        });
      }
    });
    
    // Agregar estudiantes asignados sin mensajes aún
    students.forEach(student => {
      const dmChannel = `dm_${[teacherId, student.user_id].sort().join('_')}`;
      if (!map.has(dmChannel)) {
        map.set(dmChannel, {
          channel: dmChannel,
          last_message_at: new Date(0).toISOString(), // Fecha muy antigua
          last_message_preview: 'Iniciar conversación...',
          participants: [teacherId, student.user_id],
          student_name: student.name,
          unread: 0
        });
      }
    });
    
    const list = Array.from(map.values()).sort((a,b) => {
      if (a.channel === 'general') return -1;
      if (b.channel === 'general') return 1;
      return b.last_message_at.localeCompare(a.last_message_at);
    });
    
    setThreads(list);
    setLoading(false);
  }, [supabase, teacherId]); // Removida dependencia de assignedStudents

  useEffect(() => { loadThreads(); }, [loadThreads]);

  useEffect(() => {
    const channelSub = supabase
      .channel('messages_dashboard_'+teacherId)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `channel=like.dm_${teacherId}%` 
      }, payload => {
        // Solo actualizar threads específicos en lugar de recargar todo
        setThreads(prev => {
          const newMessage = payload.new as any;
          const updated = prev.map(thread => {
            if (thread.channel === newMessage.channel) {
              return {
                ...thread,
                last_message_at: newMessage.created_at,
                last_message_preview: newMessage.content.slice(0, 60)
              };
            }
            return thread;
          });
          return updated.sort((a,b) => {
            if (a.channel === 'general') return -1;
            if (b.channel === 'general') return 1;
            return b.last_message_at.localeCompare(a.last_message_at);
          });
        });
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: 'channel=eq.general' 
      }, payload => {
        setThreads(prev => {
          const newMessage = payload.new as any;
          return prev.map(thread => {
            if (thread.channel === 'general') {
              return {
                ...thread,
                last_message_at: newMessage.created_at,
                last_message_preview: newMessage.content.slice(0, 60)
              };
            }
            return thread;
          });
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channelSub); };
  }, [supabase, teacherId]); // Removida dependencia de loadThreads

  const filteredThreads = threads.filter(t => !search || t.channel.includes(search) || t.last_message_preview.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '700px' }}>
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-secondary, #fff)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <MessageSquare size={18} />
          <strong style={{ fontSize: '.9rem' }}>Chats</strong>
        </div>
        <div style={{ padding: '.75rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', opacity: .5 }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar" style={{ width: '100%', padding: '.5rem .75rem .5rem 2rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.15)', fontSize: '.75rem' }} />
        </div>
        <div style={{ flex:1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading && <div style={{ padding: '1rem', fontSize: '.7rem', opacity:.7, display:'flex', alignItems:'center', gap:'.5rem' }}><Loader2 size={14} className="spin"/> Cargando...</div>}
          {error && <div style={{ padding: '1rem', fontSize: '.7rem', color:'#dc2626' }}>Error: {error}</div>}
          {!loading && filteredThreads.map(th => (
            <button key={th.channel} onClick={()=> setActiveChannel(th.channel)} style={{
              textAlign:'left', padding:'.75rem 1rem', border:'none', background: activeChannel===th.channel ? 'rgba(59,130,246,0.12)' : 'transparent', cursor:'pointer', borderLeft: activeChannel===th.channel ? '3px solid #3b82f6':'3px solid transparent', display:'flex', flexDirection:'column', gap:'.35rem'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'.75rem', fontWeight:600 }}>
                  {th.channel === 'general' ? 'General' : th.student_name || `Chat ${th.channel.replace('dm_','')}`}
                </span>
                <span style={{ fontSize:'.55rem', opacity:.6 }}>
                  {th.last_message_at !== new Date(0).toISOString() ? new Date(th.last_message_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </span>
              </div>
              <span style={{ fontSize:'.65rem', opacity:.7 }}>{th.last_message_preview}</span>
            </button>
          ))}
          {!loading && !threads.length && (
            <div style={{ padding:'1rem', fontSize:'.7rem', opacity:.7 }}>Sin conversaciones aún.</div>
          )}
        </div>
        <div style={{ padding: '.6rem 1rem', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '.55rem', opacity:.6, display:'flex', alignItems:'center', gap:4 }}>
          <Shield size={10} /> Solo estudiantes asignados</div>
      </div>
      <div style={{ flex:1 }}>
        {activeChannel === 'general' ? (
          <StudentChat userId={teacherId} channel="general" />
        ) : (
          // Para chats DM, extraer studentId del canal
          <StudentChat 
            userId={teacherId} 
            teacherId={teacherId}
            studentId={activeChannel.startsWith('dm_') ? activeChannel.replace('dm_','').split('_').find((id: string) => id !== teacherId) : undefined}
          />
        )}
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
