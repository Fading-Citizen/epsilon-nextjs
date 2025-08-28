'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, Cloud, Database as Db, ShieldAlert, CheckCircle2, RefreshCcw } from 'lucide-react'

interface Status {
  ok: boolean
  latencyMs?: number
  error?: string
  lastChecked: Date
}

const SupabaseStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<Status>({ ok: true, lastChecked: new Date() })
  const [loading, setLoading] = useState(false)

  const testQuery = async () => {
    setLoading(true)
    const start = performance.now()
    const supabase = createClient()
    try {
      // Lightweight ping: request current user (auth) then a trivial RPC-less call
      const { error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const { error: tableError } = await supabase
        .from('_ping') // create a lightweight table _ping(id int) OR falls back to no-op
        .select('id')
        .limit(1)
      const latency = performance.now() - start
      if (tableError) {
        // If table doesn't exist we still treat connectivity as OK
        setStatus({ ok: true, latencyMs: Math.round(latency), error: tableError.message.includes('relation') ? undefined : tableError.message, lastChecked: new Date() })
      } else {
        setStatus({ ok: true, latencyMs: Math.round(latency), lastChecked: new Date() })
      }
    } catch (e: any) {
      setStatus({ ok: false, error: e?.message || 'Unknown error', lastChecked: new Date() })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { testQuery() }, [])

  const color = status.ok ? '#22c55e' : '#ef4444'

  return (
    <div style={{
      background: 'var(--widget-bg, rgba(0,0,0,0.05))',
      border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: 16,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          {status.ok ? <CheckCircle2 size={18} color={color} /> : <ShieldAlert size={18} color={color} />}
          <strong style={{ fontSize: '.9rem' }}>Supabase</strong>
        </div>
        <button
          onClick={testQuery}
          disabled={loading}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: '#555'
          }}
          title="Refrescar"
        >
          <RefreshCcw size={14} style={{ opacity: loading ? 0.4 : 1, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.5rem', fontSize: '.7rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.04)', padding: '.5rem .6rem', borderRadius: 10 }}>
          <span style={{ opacity: .6 }}>Estado</span>
          <span style={{ fontWeight: 600, color }}>{status.ok ? 'OK' : 'Falla'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.04)', padding: '.5rem .6rem', borderRadius: 10 }}>
          <span style={{ opacity: .6 }}>Latencia</span>
          <span style={{ fontWeight: 600 }}>{status.latencyMs !== undefined ? status.latencyMs + 'ms' : '—'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.04)', padding: '.5rem .6rem', borderRadius: 10 }}>
          <span style={{ opacity: .6 }}>Último</span>
          <span style={{ fontWeight: 600 }}>{status.lastChecked.toLocaleTimeString()}</span>
        </div>
      </div>

      {status.error && (
        <div style={{
          fontSize: '.65rem',
          color: '#b91c1c',
          background: 'rgba(239,68,68,0.08)',
          padding: '.5rem .6rem',
          borderRadius: 10,
          lineHeight: 1.2
        }}>
          {status.error}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default SupabaseStatusWidget
