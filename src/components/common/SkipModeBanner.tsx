/**
 * Banner que se muestra en la parte superior de la página
 * cuando el modo Skip está activo
 */

'use client';

import React from 'react';
import styled from 'styled-components';
import { useSkipMode } from '@/hooks/useSkipMode';
import { X, AlertTriangle } from 'lucide-react';

export const SkipModeBanner: React.FC = () => {
  const { isSkipMode, skipRole, clearSkipMode, isLoading } = useSkipMode();
  const [visible, setVisible] = React.useState(true);

  if (isLoading || !isSkipMode || !visible) {
    return null;
  }

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleExit = () => {
    if (confirm('¿Salir del modo Skip y volver al login?')) {
      clearSkipMode();
      window.location.href = '/login';
    }
  };

  return (
    <BannerWrapper>
      <BannerContent>
        <IconSection>
          <AlertTriangle size={24} />
        </IconSection>
        
        <TextSection>
          <BannerTitle>⚡ Modo Skip Activo (Sin Base de Datos)</BannerTitle>
          <BannerDescription>
            Estás usando datos simulados como <strong>{skipRole === 'admin' ? 'Administrador' : 'Estudiante'}</strong>.
            Las funciones que requieren Supabase no funcionarán.
          </BannerDescription>
        </TextSection>

        <ActionsSection>
          <ExitButton onClick={handleExit}>
            Salir del Skip
          </ExitButton>
          <DismissButton onClick={handleDismiss} title="Ocultar banner">
            <X size={20} />
          </DismissButton>
        </ActionsSection>
      </BannerContent>
    </BannerWrapper>
  );
};

const BannerWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const BannerContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 12px;
  }
`;

const IconSection = styled.div`
  display: flex;
  align-items: center;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const TextSection = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
`;

const BannerDescription = styled.div`
  font-size: 13px;
  opacity: 0.95;

  strong {
    font-weight: 600;
    text-decoration: underline;
  }
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ExitButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 12px;
  }
`;

const DismissButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export default SkipModeBanner;
