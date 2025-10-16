'use client';

import React from 'react';
import SummaryPage from './SummaryPage';

// Este es un componente de ejemplo para demostrar SummaryPage
// En producción, estos datos vendrían de la API

const SummaryPageExample: React.FC = () => {
  // Datos de ejemplo
  const exampleData = {
    simulacroTitle: 'Simulacro ICFES - Matemáticas 2025',
    totalQuestions: 30,
    timeLimitMinutes: 60,
    passingScore: 70,
    
    performanceThreshold: {
      id: 'high',
      name: 'Alto',
      minPercentage: 75,
      maxPercentage: 89,
      color: '#3b82f6',
      messageHtml: `
        <h3 style="color: #3b82f6;">⭐ ¡Excelente Trabajo!</h3>
        <p>Has demostrado un buen dominio de las matemáticas. Estás en el camino correcto.</p>
        <p><strong>Recomendaciones:</strong></p>
        <ul>
          <li>Continúa practicando para alcanzar el nivel superior</li>
          <li>Revisa las preguntas incorrectas para identificar áreas de mejora</li>
          <li>Practica más problemas de geometría y álgebra</li>
        </ul>
      `
    },
    
    currentAttempt: {
      score: 83.33,
      percentage: 83.33,
      timeSpentSeconds: 2520, // 42 minutos
      correctAnswers: 25,
      incorrectAnswers: 4,
      blankAnswers: 1,
      passed: true,
      date: new Date()
    },
    
    attemptHistory: [
      {
        attemptNumber: 1,
        date: new Date(2025, 9, 10),
        score: 70.0,
        timeSpent: 3000,
        correctAnswers: 21,
        incorrectAnswers: 7,
        blankAnswers: 2
      },
      {
        attemptNumber: 2,
        date: new Date(2025, 9, 13),
        score: 76.67,
        timeSpent: 2700,
        correctAnswers: 23,
        incorrectAnswers: 6,
        blankAnswers: 1
      },
      {
        attemptNumber: 3,
        date: new Date(2025, 9, 15),
        score: 80.0,
        timeSpent: 2580,
        correctAnswers: 24,
        incorrectAnswers: 5,
        blankAnswers: 1
      },
      {
        attemptNumber: 4,
        date: new Date(), // Intento actual
        score: 83.33,
        timeSpent: 2520,
        correctAnswers: 25,
        incorrectAnswers: 4,
        blankAnswers: 1
      }
    ],
    
    platformStats: {
      totalAttempts: 1547,
      averageScore: 72.5,
      averageTime: 2850,
      totalStudents: 423,
      passRate: 68.5
    }
  };

  const handleRetry = () => {
    console.log('Retry clicked');
    // Aquí iría la lógica para reiniciar el simulacro
  };

  const handleExit = () => {
    console.log('Exit clicked');
    // Aquí iría la lógica para salir al dashboard
  };

  const handleReviewAnswers = () => {
    console.log('Review answers clicked');
    // Aquí iría la lógica para revisar respuestas detalladas
  };

  return (
    <SummaryPage
      simulacroTitle={exampleData.simulacroTitle}
      totalQuestions={exampleData.totalQuestions}
      timeLimitMinutes={exampleData.timeLimitMinutes}
      passingScore={exampleData.passingScore}
      performanceThreshold={exampleData.performanceThreshold}
      currentAttempt={exampleData.currentAttempt}
      attemptHistory={exampleData.attemptHistory}
      platformStats={exampleData.platformStats}
      onRetry={handleRetry}
      onExit={handleExit}
      onReviewAnswers={handleReviewAnswers}
    />
  );
};

export default SummaryPageExample;
