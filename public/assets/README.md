# 📁 Assets - Contenido Multimedia para Epsilon Academy

## 📍 Ubicación
Esta carpeta se encuentra en: `public/assets/`

## 📂 Estructura de Carpetas

### 🖼️ `/images/`
Para todas las imágenes del proyecto:
- **Avatares de usuarios:** `avatar-1.jpg`, `avatar-2.png`, etc.
- **Logos:** `logo.png`, `logo-dark.png`, `logo-light.svg`
- **Banners:** `banner-matematicas.jpg`, `banner-fisica.png`
- **Ilustraciones de cursos:** `course-calculus.jpg`, `course-algebra.png`
- **Iconos personalizados:** `custom-icon-1.svg`, `custom-icon-2.png`
- **Fondos:** `bg-dashboard.jpg`, `bg-login.png`

### 🎯 `/icons/`
Para iconos específicos del sistema:
- **Iconos de categorías:** `math-icon.svg`, `physics-icon.svg`
- **Iconos de estado:** `completed.svg`, `in-progress.svg`
- **Iconos de acciones:** `edit.svg`, `delete.svg`, `add.svg`

### 🎥 `/videos/`
Para contenido de video:
- **Videos promocionales:** `intro-epsilon.mp4`
- **Tutoriales:** `tutorial-dashboard.mp4`
- **Videos de ejemplo:** `sample-lesson.mp4`

### 🔊 `/audio/`
Para contenido de audio:
- **Notificaciones:** `notification.mp3`, `success.wav`
- **Audio de lecciones:** `lesson-1-audio.mp3`

## 🚀 Cómo Usar los Assets

### En React Components:
\`\`\`jsx
// Para imágenes
<img src="/assets/images/logo.png" alt="Logo" />

// Para iconos
<img src="/assets/icons/math-icon.svg" alt="Matemáticas" />

// Para videos
<video src="/assets/videos/intro-epsilon.mp4" controls />

// Para audio
<audio src="/assets/audio/notification.mp3" autoPlay />
\`\`\`

### En CSS:
\`\`\`css
.dashboard-bg {
  background-image: url('/assets/images/bg-dashboard.jpg');
}

.icon-math {
  background-image: url('/assets/icons/math-icon.svg');
}
\`\`\`

## 📋 Formatos Recomendados

### Imágenes:
- **PNG:** Para logos, iconos con transparencia
- **JPG/JPEG:** Para fotos, banners, fondos
- **SVG:** Para iconos vectoriales, logos escalables
- **WebP:** Para optimización web (alternativo)

### Videos:
- **MP4:** Formato principal
- **WebM:** Alternativo para mejor compresión

### Audio:
- **MP3:** Formato principal
- **WAV:** Para alta calidad
- **OGG:** Alternativo para web

## 💡 Consejos de Optimización

1. **Comprime las imágenes** antes de subirlas
2. **Usa SVG** para iconos simples
3. **Mantén videos bajo 10MB** cuando sea posible
4. **Usa nombres descriptivos:** `course-mathematics-banner.jpg` en lugar de `img1.jpg`

## 🎨 Assets Sugeridos para el Dashboard

### Imágenes necesarias:
- `logo-epsilon.svg` - Logo principal
- `avatar-default.png` - Avatar por defecto
- `bg-dashboard.jpg` - Fondo del dashboard
- `course-placeholder.jpg` - Imagen por defecto para cursos
- `banner-welcome.jpg` - Banner de bienvenida

### Iconos necesarios:
- `dashboard-icon.svg`
- `users-icon.svg`
- `courses-icon.svg`
- `analytics-icon.svg`
- `settings-icon.svg`

---

**Nota:** Todos los archivos en esta carpeta son accesibles públicamente a través de la URL `/assets/...`
