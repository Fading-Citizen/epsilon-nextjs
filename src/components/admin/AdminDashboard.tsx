'use client'

import React from 'react';
import styled from 'styled-components';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <StyledWrapper>
      <header className="header">
        <div className="header-content">
          <img 
            src="/assets/images/LogotipoBlanco.png" 
            alt="Epsilon Academy" 
            className="logo"
          />
          <div className="user-info">
            <span>Administrador {user.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-grid">
          <div className="welcome-card">
            <h1>Panel de Administración</h1>
            <p>Control total de la plataforma educativa</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Usuarios</h3>
                <p className="stat-number">1,247</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍🎓</div>
              <div className="stat-content">
                <h3>Estudiantes</h3>
                <p className="stat-number">1,156</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-content">
                <h3>Profesores</h3>
                <p className="stat-number">91</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>Cursos Activos</h3>
                <p className="stat-number">342</p>
              </div>
            </div>
          </div>

          <div className="management-grid">
            <div className="management-section">
              <h2>Gestión de Usuarios</h2>
              <div className="management-actions">
                <button className="action-btn primary">
                  <span className="action-icon">➕</span>
                  Agregar Usuario
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">👥</span>
                  Ver Todos los Usuarios
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">🔧</span>
                  Gestionar Roles
                </button>
              </div>
            </div>

            <div className="management-section">
              <h2>Gestión de Cursos</h2>
              <div className="management-actions">
                <button className="action-btn primary">
                  <span className="action-icon">📚</span>
                  Crear Curso
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">📊</span>
                  Estadísticas de Cursos
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">✅</span>
                  Aprobar Cursos
                </button>
              </div>
            </div>

            <div className="management-section">
              <h2>Sistema</h2>
              <div className="management-actions">
                <button className="action-btn warning">
                  <span className="action-icon">⚙️</span>
                  Configuraciones
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">📈</span>
                  Reportes
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">🔒</span>
                  Seguridad
                </button>
              </div>
            </div>
          </div>

          <div className="recent-users">
            <h2>Usuarios Recientes</h2>
            <div className="users-table">
              <div className="table-header">
                <span>Usuario</span>
                <span>Rol</span>
                <span>Fecha Registro</span>
                <span>Estado</span>
              </div>
              <div className="table-row">
                <span>Ana García</span>
                <span className="role student">Estudiante</span>
                <span>Hace 2 horas</span>
                <span className="status active">Activo</span>
              </div>
              <div className="table-row">
                <span>Carlos López</span>
                <span className="role teacher">Profesor</span>
                <span>Ayer</span>
                <span className="status active">Activo</span>
              </div>
              <div className="table-row">
                <span>María Rodríguez</span>
                <span className="role student">Estudiante</span>
                <span>Hace 2 días</span>
                <span className="status pending">Pendiente</span>
              </div>
              <div className="table-row">
                <span>Jorge Martín</span>
                <span className="role student">Estudiante</span>
                <span>Hace 3 días</span>
                <span className="status active">Activo</span>
              </div>
            </div>
          </div>

          <div className="system-health">
            <h2>Estado del Sistema</h2>
            <div className="health-grid">
              <div className="health-card">
                <div className="health-indicator green"></div>
                <div className="health-content">
                  <h3>Servidor</h3>
                  <p>Funcionando correctamente</p>
                </div>
              </div>
              <div className="health-card">
                <div className="health-indicator green"></div>
                <div className="health-content">
                  <h3>Base de Datos</h3>
                  <p>Conexión estable</p>
                </div>
              </div>
              <div className="health-card">
                <div className="health-indicator yellow"></div>
                <div className="health-content">
                  <h3>Almacenamiento</h3>
                  <p>85% utilizado</p>
                </div>
              </div>
              <div className="health-card">
                <div className="health-indicator green"></div>
                <div className="health-content">
                  <h3>API</h3>
                  <p>Respuesta rápida</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .header {
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    height: 40px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logout-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .dashboard-grid {
    display: grid;
    gap: 2rem;
  }

  .welcome-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .welcome-card h1 {
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
  }

  .welcome-card p {
    color: #666;
    font-size: 1.1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-content h3 {
    color: #333;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #FF9800;
    margin: 0;
  }

  .management-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .management-section {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .management-section h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .management-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    font-weight: 500;
  }

  .action-btn.primary {
    background: #FF9800;
    color: white;
  }

  .action-btn.primary:hover {
    background: #F57C00;
    transform: translateY(-2px);
  }

  .action-btn.secondary {
    background: #f8f9fa;
    color: #333;
    border: 2px solid #e1e5e9;
  }

  .action-btn.secondary:hover {
    background: #e9ecef;
    border-color: #FF9800;
  }

  .action-btn.warning {
    background: #FFC107;
    color: #333;
  }

  .action-btn.warning:hover {
    background: #FFB300;
    transform: translateY(-2px);
  }

  .action-icon {
    font-size: 1.2rem;
  }

  .recent-users {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .recent-users h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .users-table {
    display: grid;
    gap: 0.5rem;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    font-weight: 600;
    color: #333;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #e1e5e9;
    align-items: center;
  }

  .role {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    text-align: center;
  }

  .role.student {
    background: #E3F2FD;
    color: #1976D2;
  }

  .role.teacher {
    background: #E8F5E8;
    color: #388E3C;
  }

  .status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.9rem;
    text-align: center;
  }

  .status.active {
    background: #E8F5E8;
    color: #388E3C;
  }

  .status.pending {
    background: #FFF3E0;
    color: #F57C00;
  }

  .system-health {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .system-health h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .health-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
  }

  .health-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .health-indicator.green {
    background: #4CAF50;
  }

  .health-indicator.yellow {
    background: #FFC107;
  }

  .health-indicator.red {
    background: #F44336;
  }

  .health-content h3 {
    color: #333;
    margin-bottom: 0.25rem;
    font-size: 1rem;
  }

  .health-content p {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .header-content {
      padding: 0 1rem;
    }

    .main-content {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .management-grid {
      grid-template-columns: 1fr;
    }

    .health-grid {
      grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .table-header {
      display: none;
    }

    .table-row {
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      border: none;
    }
  }
`;

export default AdminDashboard;
