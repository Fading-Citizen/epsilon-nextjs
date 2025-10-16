'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/lib/auth/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Redirect based on user role (you can implement role-based logic here)
        router.push('/student'); // Default redirect
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setLoading(true);
    setError('');
    
    // Demo users credentials - Usando las nuevas credenciales que funcionan
    const demoCredentials = {
      student: { email: 'student.demo@epsilon.com', password: 'demo123' },
      teacher: { email: 'teacher.demo@epsilon.com', password: 'demo123' },
      admin: { email: 'admin.demo@epsilon.com', password: 'demo123' }
    };

    const creds = demoCredentials[role as keyof typeof demoCredentials];
    
    if (!creds) {
      setError('Rol de demo no válido');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signIn(creds.email, creds.password);
      
      if (error) {
        console.error('Error en demo login:', error);
        setError(`Error demo ${role}: ${error.message}`);
      } else {
        router.push(`/${role}`);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="background">
        <div className="form-container">
          <div className="logo-section">
            <img 
              src="/assets/images/LogotipoBlanco.png" 
              alt="Epsilon Academy" 
              className="logo-image"
            />
          </div>
          
          <div className="form-content">
            <h1 className="title">Iniciar Sesión</h1>
            <p className="subtitle">Accede a tu plataforma educativa</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form className="form" onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
            
            <div className="demo-section">
              <p className="demo-title">Usuarios Demo:</p>
              <div className="demo-buttons">
                <button 
                  className="demo-button student"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                >
                  👨‍🎓 Estudiante
                </button>
                <button 
                  className="demo-button admin"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                >
                  👨‍🏫 Administrador
                  👨‍🏫 Administrador
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .background {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .form-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .logo-section {
    text-align: center;
    margin-bottom: 30px;
  }

  .logo-image {
    width: 150px;
    height: auto;
  }

  .form-content {
    text-align: center;
  }

  .title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #666;
    margin-bottom: 30px;
    font-size: 16px;
  }

  .error-message {
    background: #fee;
    color: #c33;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .form {
    margin-bottom: 30px;
  }

  .input-group {
    margin-bottom: 20px;
    text-align: left;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .input-group input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .input-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .submit-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .demo-section {
    border-top: 1px solid #e1e5e9;
    padding-top: 20px;
  }

  .demo-title {
    color: #666;
    margin-bottom: 15px;
    font-size: 14px;
  }

  .demo-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .demo-button {
    padding: 10px 15px;
    border: 2px solid;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .demo-button.student {
    border-color: #4CAF50;
    color: #4CAF50;
  }

  .demo-button.student:hover:not(:disabled) {
    background: #4CAF50;
    color: white;
  }

  .demo-button.teacher {
    border-color: #2196F3;
    color: #2196F3;
  }

  .demo-button.teacher:hover:not(:disabled) {
    background: #2196F3;
    color: white;
  }

  .demo-button.admin {
    border-color: #FF9800;
    color: #FF9800;
  }

  .demo-button.admin:hover:not(:disabled) {
    background: #FF9800;
    color: white;
  }

  .demo-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default LoginForm;
