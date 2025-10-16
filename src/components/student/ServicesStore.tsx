"use client";

import React, { useState } from 'react';
import { ShoppingCart, Check, X, Star, Users, Clock, BookOpen, Search, Filter, ChevronRight, Package, CreditCard, Gift } from 'lucide-react';

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  precio: number;
  precioOriginal?: number;
  duracion: string;
  categoria: string;
  popular?: boolean;
  nuevo?: boolean;
  descuento?: number;
  features: string[];
  rating: number;
  usuarios: number;
  incluye: {
    simulacros?: string;
    cursos?: string;
    clases?: string;
    soporte?: string;
  };
}

interface Props {
  serviciosAdquiridos: string[];
  isDarkMode?: boolean;
  onAdquirir?: (servicioId: string) => void;
  onClose?: () => void;
}

export default function ServicesStore({ serviciosAdquiridos, isDarkMode = false, onAdquirir, onClose }: Props) {
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Servicios disponibles
  const servicios: Servicio[] = [
    {
      id: 'icfes',
      nombre: 'ICFES Premium',
      descripcion: 'Preparación completa para el examen ICFES con acceso a todos los simulacros y material de estudio',
      icono: '📚',
      color: '#3b82f6',
      precio: 120000,
      precioOriginal: 150000,
      descuento: 20,
      duracion: '3 meses',
      categoria: 'ICFES',
      popular: true,
      rating: 4.8,
      usuarios: 2456,
      features: [
        'Simulacros ilimitados',
        'Clases en vivo semanales',
        'Material descargable en PDF',
        'Seguimiento personalizado',
        'Análisis de resultados',
        'Banco de preguntas oficial'
      ],
      incluye: {
        simulacros: 'Ilimitados',
        cursos: '12 cursos',
        clases: '24 clases en vivo',
        soporte: '24/7'
      }
    },
    {
      id: 'saber-pro',
      nombre: 'Saber Pro',
      descripcion: 'Curso integral de preparación para el examen Saber Pro con enfoque en competencias genéricas',
      icono: '🎓',
      color: '#10b981',
      precio: 150000,
      duracion: '4 meses',
      categoria: 'Saber Pro',
      rating: 4.7,
      usuarios: 1893,
      features: [
        'Razonamiento cuantitativo',
        'Competencias ciudadanas',
        'Lectura crítica',
        'Inglés B1-B2',
        'Simulacros por competencia',
        'Tutorías personalizadas'
      ],
      incluye: {
        simulacros: '50+ simulacros',
        cursos: '16 cursos',
        clases: '32 clases en vivo',
        soporte: 'Prioritario'
      }
    },
    {
      id: 'admisiones',
      nombre: 'Admisiones Universitarias',
      descripcion: 'Preparación especializada para exámenes de admisión a las mejores universidades del país',
      icono: '🏆',
      color: '#f59e0b',
      precio: 180000,
      precioOriginal: 220000,
      descuento: 18,
      duracion: '5 meses',
      categoria: 'Admisiones',
      nuevo: true,
      rating: 4.9,
      usuarios: 1567,
      features: [
        'Matemáticas avanzadas',
        'Física universitaria',
        'Química orgánica e inorgánica',
        'Biología molecular',
        'Simulacros por universidad',
        'Asesoría vocacional'
      ],
      incluye: {
        simulacros: 'Por universidad',
        cursos: '20 cursos',
        clases: '40 clases en vivo',
        soporte: 'Premium 24/7'
      }
    },
    {
      id: 'cursos-especializados',
      nombre: 'Cursos Especializados',
      descripcion: 'Acceso a cursos avanzados en áreas específicas de conocimiento con certificación',
      icono: '💼',
      color: '#8b5cf6',
      precio: 95000,
      duracion: '2 meses',
      categoria: 'Cursos Especializados',
      popular: true,
      rating: 4.6,
      usuarios: 3124,
      features: [
        'Contenido especializado',
        'Certificación internacional',
        'Tutorías personalizadas',
        'Proyectos prácticos',
        'Material exclusivo',
        'Comunidad de aprendizaje'
      ],
      incluye: {
        simulacros: '30 evaluaciones',
        cursos: '8 cursos',
        clases: '16 clases',
        soporte: 'Email'
      }
    },
    {
      id: 'corporativo',
      nombre: 'Plan Corporativo',
      descripcion: 'Solución empresarial completa para capacitación y desarrollo de equipos',
      icono: '💼',
      color: '#ef4444',
      precio: 500000,
      duracion: '12 meses',
      categoria: 'Corporativo',
      rating: 4.9,
      usuarios: 156,
      features: [
        'Licencias ilimitadas',
        'Dashboard administrativo',
        'Reportes personalizados',
        'API de integración',
        'Soporte dedicado',
        'Capacitación on-boarding',
        'Contenido personalizado'
      ],
      incluye: {
        simulacros: 'Ilimitados',
        cursos: 'Todos',
        clases: 'Personalizadas',
        soporte: 'Gerente de cuenta'
      }
    }
  ];

  // Filtros
  const serviciosFiltrados = servicios.filter(servicio => {
    const matchesSearch = servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === 'todos' || servicio.categoria === selectedCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  const categorias = ['todos', ...Array.from(new Set(servicios.map(s => s.categoria)))];

  const handlePurchase = (servicio: Servicio) => {
    setSelectedService(servicio);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedService && onAdquirir) {
      onAdquirir(selectedService.id);
    }
    setShowPurchaseModal(false);
    setSelectedService(null);
  };

  const tieneServicio = (servicioId: string) => {
    return serviciosAdquiridos.includes(servicioId);
  };

  return (
    <div style={{
      ...styles.container,
      background: isDarkMode ? '#111827' : '#f9fafb',
      color: isDarkMode ? '#f3f4f6' : '#111827'
    }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{
            ...styles.title,
            background: isDarkMode 
              ? 'linear-gradient(135deg, #60a5fa, #a78bfa)' 
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Tienda de Servicios
          </h1>
          <p style={{
            ...styles.subtitle,
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            Descubre y adquiere los servicios que necesitas para alcanzar tus metas
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            ...styles.closeButton,
            color: isDarkMode ? '#9ca3af' : '#6b7280'
          }}>
            <X size={24} />
          </button>
        )}
      </div>

      {/* Banner promocional */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Gift size={32} />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>¡Ofertas Especiales!</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Hasta 20% de descuento en servicios seleccionados</div>
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Válido hasta fin de mes</div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={{
          ...styles.searchBox,
          background: isDarkMode ? '#1f2937' : '#ffffff',
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
        }}>
          <Search size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.searchInput,
              background: 'transparent',
              color: isDarkMode ? '#f3f4f6' : '#111827'
            }}
          />
        </div>

        <div style={styles.categoriesContainer}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              style={{
                ...styles.categoryButton,
                background: selectedCategoria === cat 
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                  : isDarkMode ? '#1f2937' : '#ffffff',
                color: selectedCategoria === cat ? '#ffffff' : (isDarkMode ? '#f3f4f6' : '#374151'),
                border: `1px solid ${selectedCategoria === cat ? 'transparent' : (isDarkMode ? '#374151' : '#e5e7eb')}`
              }}
            >
              {cat === 'todos' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de servicios */}
      <div style={styles.servicesGrid}>
        {serviciosFiltrados.map(servicio => {
          const adquirido = tieneServicio(servicio.id);
          
          return (
            <div
              key={servicio.id}
              style={{
                ...styles.serviceCard,
                background: isDarkMode ? '#1f2937' : '#ffffff',
                border: `2px solid ${adquirido ? servicio.color : (isDarkMode ? '#374151' : '#e5e7eb')}`,
                opacity: adquirido ? 0.8 : 1
              }}
            >
              {/* Badges */}
              <div style={styles.badgesContainer}>
                {servicio.popular && (
                  <span style={{ ...styles.badge, background: '#f59e0b', color: 'white' }}>
                    ⭐ Popular
                  </span>
                )}
                {servicio.nuevo && (
                  <span style={{ ...styles.badge, background: '#10b981', color: 'white' }}>
                    🆕 Nuevo
                  </span>
                )}
                {servicio.descuento && (
                  <span style={{ ...styles.badge, background: '#ef4444', color: 'white' }}>
                    -{servicio.descuento}%
                  </span>
                )}
                {adquirido && (
                  <span style={{ ...styles.badge, background: servicio.color, color: 'white' }}>
                    ✓ Adquirido
                  </span>
                )}
              </div>

              {/* Icon y título */}
              <div style={styles.cardHeader}>
                <div style={{
                  ...styles.iconCircle,
                  background: `${servicio.color}20`,
                  color: servicio.color
                }}>
                  <span style={{ fontSize: '2rem' }}>{servicio.icono}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    ...styles.serviceName,
                    color: isDarkMode ? '#f3f4f6' : '#111827'
                  }}>
                    {servicio.nombre}
                  </h3>
                  <div style={styles.ratingContainer}>
                    <Star size={14} fill={servicio.color} color={servicio.color} />
                    <span style={{ fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                      {servicio.rating}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                      ({servicio.usuarios.toLocaleString()} usuarios)
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <p style={{
                ...styles.description,
                color: isDarkMode ? '#9ca3af' : '#6b7280'
              }}>
                {servicio.descripcion}
              </p>

              {/* Features */}
              <div style={styles.featuresContainer}>
                {servicio.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} style={styles.featureItem}>
                    <Check size={14} color={servicio.color} />
                    <span style={{
                      fontSize: '0.875rem',
                      color: isDarkMode ? '#d1d5db' : '#374151'
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
                {servicio.features.length > 4 && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    marginTop: '0.5rem'
                  }}>
                    +{servicio.features.length - 4} características más
                  </div>
                )}
              </div>

              {/* Incluye */}
              <div style={{
                ...styles.includeSection,
                background: isDarkMode ? '#111827' : '#f9fafb'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: servicio.color, marginBottom: '0.5rem' }}>
                  INCLUYE
                </div>
                <div style={styles.includeGrid}>
                  {servicio.incluye.simulacros && (
                    <div style={styles.includeItem}>
                      <BookOpen size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                      <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                        {servicio.incluye.simulacros}
                      </span>
                    </div>
                  )}
                  {servicio.incluye.cursos && (
                    <div style={styles.includeItem}>
                      <Package size={12} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                      <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                        {servicio.incluye.cursos}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div style={styles.priceSection}>
                <div>
                  {servicio.precioOriginal && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      textDecoration: 'line-through'
                    }}>
                      ${servicio.precioOriginal.toLocaleString()}
                    </div>
                  )}
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: servicio.color
                  }}>
                    ${servicio.precio.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    Pago único · {servicio.duracion}
                  </div>
                </div>

                <button
                  onClick={() => !adquirido && handlePurchase(servicio)}
                  disabled={adquirido}
                  style={{
                    ...styles.purchaseButton,
                    background: adquirido 
                      ? (isDarkMode ? '#374151' : '#e5e7eb')
                      : `linear-gradient(135deg, ${servicio.color}, ${servicio.color}dd)`,
                    cursor: adquirido ? 'not-allowed' : 'pointer',
                    opacity: adquirido ? 0.6 : 1
                  }}
                >
                  {adquirido ? (
                    <>
                      <Check size={18} />
                      Adquirido
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Adquirir
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {serviciosFiltrados.length === 0 && (
        <div style={styles.emptyState}>
          <Package size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
          <p style={{ marginTop: '1rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
            No se encontraron servicios que coincidan con tu búsqueda
          </p>
        </div>
      )}

      {/* Modal de confirmación de compra */}
      {showPurchaseModal && selectedService && (
        <div style={styles.modalOverlay} onClick={() => setShowPurchaseModal(false)}>
          <div style={{
            ...styles.modal,
            background: isDarkMode ? '#1f2937' : '#ffffff'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{
                ...styles.modalTitle,
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}>
                Confirmar Adquisición
              </h2>
              <button onClick={() => setShowPurchaseModal(false)} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  ...styles.iconCircle,
                  background: `${selectedService.color}20`,
                  color: selectedService.color,
                  width: '64px',
                  height: '64px'
                }}>
                  <span style={{ fontSize: '2rem' }}>{selectedService.icono}</span>
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    color: isDarkMode ? '#f3f4f6' : '#111827'
                  }}>
                    {selectedService.nombre}
                  </h3>
                  <p style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.875rem',
                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                  }}>
                    {selectedService.duracion} de acceso
                  </p>
                </div>
              </div>

              <div style={{
                background: isDarkMode ? '#111827' : '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: selectedService.color, marginBottom: '0.75rem' }}>
                  RESUMEN DE COMPRA
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#374151' }}>Subtotal</span>
                  <span style={{ fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#374151' }}>
                    ${selectedService.precioOriginal?.toLocaleString() || selectedService.precio.toLocaleString()}
                  </span>
                </div>
                {selectedService.descuento && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#10b981' }}>Descuento ({selectedService.descuento}%)</span>
                    <span style={{ fontSize: '0.875rem', color: '#10b981' }}>
                      -${((selectedService.precioOriginal! - selectedService.precio)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{
                  borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  paddingTop: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
                      Total
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: selectedService.color }}>
                      ${selectedService.precio.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: isDarkMode ? '#1e3a8a20' : '#dbeafe',
                border: `1px solid ${isDarkMode ? '#1e3a8a40' : '#93c5fd'}`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#93c5fd' : '#1e40af'
                }}>
                  💡 Este es un demo. En producción, aquí se integraría un método de pago real.
                </p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowPurchaseModal(false)} style={{
                ...styles.secondaryButton,
                background: isDarkMode ? '#374151' : '#f3f4f6',
                color: isDarkMode ? '#f3f4f6' : '#374151'
              }}>
                Cancelar
              </button>
              <button onClick={confirmPurchase} style={{
                ...styles.primaryButton,
                background: `linear-gradient(135deg, ${selectedService.color}, ${selectedService.color}dd)`
              }}>
                <CreditCard size={18} />
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: 0
  },
  subtitle: {
    fontSize: '0.95rem',
    marginTop: '0.5rem'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center'
  },
  filtersContainer: {
    marginBottom: '2rem'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem'
  },
  categoriesContainer: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const
  },
  categoryButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  serviceCard: {
    padding: '1.5rem',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    position: 'relative' as const
  },
  badgesContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  serviceName: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginTop: '0.25rem'
  },
  description: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    marginBottom: '1rem'
  },
  featuresContainer: {
    marginBottom: '1rem'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  includeSection: {
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  includeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem'
  },
  includeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem'
  },
  priceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  purchaseButton: {
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem'
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  modalBody: {
    padding: '1.5rem'
  },
  modalFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem'
  },
  primaryButton: {
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  secondaryButton: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
