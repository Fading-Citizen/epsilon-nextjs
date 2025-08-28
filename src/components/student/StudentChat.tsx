'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  channel: string
  sender_id: string
  content: string
  created_at: string
}

interface StudentChatProps {
  userId?: string
  channel?: string // default 'general'
  teacherId?: string // si se provee, canal privado estudiante-profesor
  studentId?: string // para chat profesor -> estudiante específico
}

/**
 * StudentChat
 * Realtime chat backed by Supabase Postgres + Realtime.
 * Chat directo profesor-estudiante basado en asignación.
 * Expected table schema (execute once in Supabase SQL editor):
 *   create table if not exists public.messages (
 *     id uuid primary key default gen_random_uuid(),
 *     channel text not null default 'general',
 *     sender_id uuid not null,
 *     content text not null check (char_length(content) > 0),
 *     created_at timestamptz not null default now()
 *   );
 *   
 *   RLS Policy: Solo profesor asignado y estudiante pueden ver/enviar mensajes
 */
export default function StudentChat({ userId: externalUserId, channel = 'general', teacherId, studentId }: StudentChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(externalUserId)

  // Determinar canal efectivo basado en relación profesor-estudiante
  const effectiveChannel = (() => {
    if (teacherId && studentId) {
      // Chat profesor -> estudiante específico
      return `dm_${[teacherId, studentId].sort().join('_')}`;
    } else if (teacherId && userId) {
      // Chat estudiante -> su profesor asignado
      return `dm_${[teacherId, userId].sort().join('_')}`;
    }
    return channel; // Canal general o personalizado
  })();

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight
      }
    })
  }

  const loadMessages = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', effectiveChannel)
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) {
      setError(error.message)
    } else if (data) {
      setMessages(data as Message[])
      scrollToBottom()
    }
    setLoading(false)
  }, [effectiveChannel, supabase])

  useEffect(() => { loadMessages() }, [loadMessages])

  // Auto obtener user si no se pasó
  useEffect(() => {
    if (!externalUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id)
      })
    }
  }, [externalUserId, supabase])

  // Realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('messages_channel_' + effectiveChannel)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel=eq.${effectiveChannel}` }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
        scrollToBottom()
      })
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [effectiveChannel, supabase])

  const sendMessage = async () => {
  if (!userId || !input.trim()) return
    setSending(true)
    const text = input.trim()
    setInput('')
  const { error } = await supabase.from('messages').insert({ channel: effectiveChannel, sender_id: userId, content: text })
    if (error) {
      setError(error.message)
      // restore input so user can retry
      setInput(text)
    }
    setSending(false)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!userId) {
    return <div style={wrapperStyle}>Cargando sesión para el chat...</div>
  }

  return (
    <div style={wrapperStyle}>
      <div style={headerStyle}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Chat General</div>
  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Canal: {effectiveChannel}</div>
      </div>

      <div ref={listRef} style={listStyle}>
        {loading && (
          <div style={infoStyle}>Cargando mensajes...</div>
        )}
        {error && (
          <div style={{ ...infoStyle, background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
            Error: {error}
            <div style={{ marginTop: 4, fontSize: '0.65rem', opacity: 0.8 }}>
              ¿Creaste la tabla 'messages'? (ver comentario en el componente)
            </div>
            <button onClick={loadMessages} style={retryBtnStyle}>Reintentar</button>
          </div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div style={infoStyle}>Sé el primero en enviar un mensaje.</div>
        )}
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === userId ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '70%',
              background: m.sender_id === userId ? '#3b82f6' : 'var(--chat-bubble-bg, rgba(0,0,0,0.06))',
              color: m.sender_id === userId ? 'white' : 'var(--chat-text, #111)',
              padding: '0.6rem 0.85rem',
              borderRadius: m.sender_id === userId ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              fontSize: '0.8rem',
              lineHeight: 1.35,
              position: 'relative'
            }}>
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.content}</div>
              <div style={{ fontSize: '0.55rem', opacity: 0.65, marginTop: 4, textAlign: 'right' }}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={inputBarStyle}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe tu mensaje y presiona Enter"
          style={inputStyle}
          disabled={sending}
        />
        <button onClick={sendMessage} disabled={sending || !input.trim()} style={sendBtnStyle}>
          {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        </button>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// Inline styles (kept minimal and theme-neutral) ---------------------------------
const wrapperStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '600px', background: 'rgba(255,255,255,0.9)', borderRadius: 16, border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden'
}
const headerStyle: React.CSSProperties = {
  padding: '0.9rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white'
}
const listStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
}
const inputBarStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(0,0,0,0.08)', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center'
}
const inputStyle: React.CSSProperties = {
  flex: 1, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 12, padding: '0.6rem 0.85rem', fontSize: '0.8rem', outline: 'none'
}
const sendBtnStyle: React.CSSProperties = {
  background: '#3b82f6', color: 'white', border: 'none', borderRadius: 12, padding: '0.55rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
}
const infoStyle: React.CSSProperties = {
  fontSize: '0.7rem', opacity: 0.8, background: 'rgba(0,0,0,0.04)', padding: '0.6rem 0.75rem', borderRadius: 12, textAlign: 'center'
}
const retryBtnStyle: React.CSSProperties = {
  marginTop: 6, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '0.35rem 0.6rem', fontSize: '0.6rem', cursor: 'pointer'
}
