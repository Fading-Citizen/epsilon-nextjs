'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Componente de emergencia para acceso directo
 * Presiona Ctrl+K para activar el modo de acceso rápido
 */
export default function EmergencyAccessPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+K para abrir el modal de emergencia
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleQuickAccess = (role: 'student' | 'admin') => {
    console.log(`🚨 EMERGENCY ACCESS: ${role}`);
    
    // Limpiar cualquier dato previo
    localStorage.clear();
    
    // Establecer modo skip
    localStorage.setItem('skipMode', 'true');
    localStorage.setItem('skipRole', role);
    localStorage.setItem('skipUser', JSON.stringify({
      id: `emergency-${role}-${Date.now()}`,
      email: `${role}@emergency.local`,
      role: role,
      name: role === 'admin' ? 'Admin Emergency' : 'Student Emergency'
    }));
    
    // Redirigir
    window.location.href = `/${role}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          🚨 Acceso de Emergencia
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Modo de desarrollo - Sin base de datos
        </p>

        <div style={{
          background: '#fff3e0',
          border: '2px solid #ff9800',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '30px'
        }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#e65100',
            textAlign: 'center'
          }}>
            ⚠️ Esta página te permite acceder directamente sin autenticación.
            <br />Solo para desarrollo.
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <button
            onClick={() => handleQuickAccess('student')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            👨‍🎓 Acceder como Estudiante
          </button>

          <button
            onClick={() => handleQuickAccess('admin')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            👨‍💼 Acceder como Admin
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>💡 Atajo de teclado:</p>
          <p style={{ margin: 0 }}>
            Presiona <kbd style={{
              background: '#fff',
              padding: '2px 6px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>Ctrl+K</kbd> en cualquier página para abrir acceso rápido
          </p>
        </div>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '10px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ← Volver al Login Normal
        </button>
      </div>

      {/* Modal de atajo rápido */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              color: '#333'
            }}>
              🚀 Acceso Rápido
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <button
                onClick={() => handleQuickAccess('student')}
                style={{
                  padding: '12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                👨‍🎓 Estudiante
              </button>
              
              <button
                onClick={() => handleQuickAccess('admin')}
                style={{
                  padding: '12px',
                  background: '#FF5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                👨‍💼 Admin
              </button>
              
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Cancelar (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
