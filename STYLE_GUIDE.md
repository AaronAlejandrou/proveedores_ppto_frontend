# Guía de Estilos - Proveedores PPTO

## Sistema de Diseño Corporativo

Este documento describe el sistema de diseño completo implementado para la aplicación "Proveedores PPTO".

## Identidad Visual

### Colores Corporativos
- **Primario**: `#0855c8` (Azul corporativo)
- **Secundario**: `#04aeea` (Azul claro)
- **Éxito**: `#10b981` (Verde)
- **Advertencia**: `#f59e0b` (Ámbar)
- **Error**: `#ef4444` (Rojo)
- **Información**: `#3b82f6` (Azul)

### Tipografía
- **Fuente Principal**: Inter (o similar sans-serif moderna)
- **Pesos**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Escala Tipográfica**:
  - Text 3xl: 1.875rem (30px)
  - Text 2xl: 1.5rem (24px)
  - Text xl: 1.25rem (20px)
  - Text lg: 1.125rem (18px)
  - Text base: 1rem (16px)
  - Text sm: 0.875rem (14px)
  - Text xs: 0.75rem (12px)

### Espaciado
Escala consistente basada en rem:
- Space 1: 0.25rem (4px)
- Space 2: 0.5rem (8px)
- Space 3: 0.75rem (12px)
- Space 4: 1rem (16px)
- Space 5: 1.25rem (20px)
- Space 6: 1.5rem (24px)
- Space 8: 2rem (32px)
- Space 10: 2.5rem (40px)
- Space 12: 3rem (48px)

### Bordes y Sombras
- **Border Radius**: 0.5rem (8px) estándar
- **Sombras**: Sistema de 5 niveles (none, sm, md, lg, xl)
- **Transiciones**: 0.15s ease-in-out estándar

## 🧩 Componentes UI

### Cards (`AppCard`)
Variantes disponibles:
- `default`: Card estándar con borde
- `elevated`: Card con sombra elevada
- `outlined`: Card con borde grueso
- `flat`: Card sin borde ni sombra

Props principales:
- `variant`: Tipo de card
- `padding`: none | sm | md | lg
- `rounded`: none | sm | md | lg | full
- `shadow`: none | sm | md | lg | xl
- `hoverable`: Efecto hover
- `clickable`: Cursor pointer

### Badges (`AppBadge`)
Variantes disponibles:
- `default`: Gris neutro
- `primary`: Azul corporativo
- `secondary`: Azul secundario
- `success`: Verde
- `warning`: Ámbar
- `error`: Rojo
- `info`: Azul claro

Props principales:
- `variant`: Tipo de badge
- `size`: sm | md | lg
- `dot`: Indicador de punto
- `outline`: Variante outline
- `uppercase`: Texto en mayúsculas

### Indicadores de Estado (`AppStatusIndicator`)
Estados soportados:
- **Purchase Orders**: CREATED, LINK_GENERATED, VIEWED_BY_PROVIDER, DOCUMENTS_PENDING, APPROVED, READY_FOR_MAIN_PPTO
- **Providers**: ACTIVE, INACTIVE, PENDING
- **Submissions**: VALIDATED, REJECTED

Props principales:
- `status`: Estado del elemento
- `variant`: dot | badge | chip
- `size`: sm | md | lg
- `showLabel`: Mostrar etiqueta
- `showIcon`: Mostrar icono
- `animated`: Animación activa

### Alertas (`AppAlert`)
Props principales:
- `type`: success | error | warning | info
- `title`: Título de la alerta
- `message`: Mensaje descriptivo
- `dismissible`: Botón para cerrar
- `timeout`: Auto-dismiss en ms
- `variant`: solid | outline | subtle

### Toasts (`AppToast`)
Sistema global de notificaciones:
- Posicionamiento: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- Auto-dismiss configurable
- Máximo de toasts simultáneos
- Soporte para acciones personalizadas

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

### Adaptaciones Principales
1. **Sidebar**: Se colapsa en mobile, se convierte en horizontal en tablet
2. **Dashboard**: Grid de 1 columna en mobile, 2 en tablet, 3+ en desktop
3. **Tablas**: Scroll horizontal en mobile, diseño adaptativo
4. **Formularios**: 1 columna en mobile, 2 en desktop
5. **Cards**: Padding reducido en mobile

## 🎯 Principios de UX/UI

### 1. Consistencia Visual
- Uso consistente de tokens de diseño
- Componentes reutilizables
- Patrones de interacción predecibles

### 2. Jerarquía Clara
- Tamaños de fuente consistentes
- Contraste adecuado para legibilidad
- Espaciado proporcional

### 3. Feedback Visual
- Estados hover y focus claros
- Indicadores de carga
- Mensajes de error/éxito informativos

### 4. Accesibilidad
- Contraste WCAG AA mínimo
- Navegación por teclado
- Etiquetas ARIA apropiadas

## 🔧 Implementación Técnica

### Estructura de Archivos
```
src/
├── styles/
│   ├── variables.css      # Tokens de diseño
│   ├── base.css          # Estilos base
│   └── layout.css        # Layouts específicos
├── components/
│   └── ui/               # Componentes UI reutilizables
│       ├── AppCard.vue
│       ├── AppBadge.vue
│       ├── AppStatusIndicator.vue
│       ├── AppAlert.vue
│       └── AppToast.vue
└── views/
    ├── admin/            # Vistas de administración
    └── provider/         # Vistas públicas
```

### CSS Custom Properties
Uso extensivo de variables CSS para:
- Colores y escalas
- Tipografía
- Espaciado
- Sombras y bordes
- Animaciones

### Componentes Vue 3
- Composition API
- TypeScript para type safety
- Props con valores por defecto
- Emits para comunicación

## 🚀 Mejoras Implementadas

### 1. Sistema de Diseño Completo
- Tokens de diseño centralizados
- Componentes reutilizables
- Guías de uso claras

### 2. Experiencia de Usuario Mejorada
- Interacciones más fluidas
- Feedback visual claro
- Estados de carga informativos

### 3. Diseño Responsivo
- Adaptación a todos los dispositivos
- Touch-friendly en mobile
- Optimización de espacio

### 4. Accesibilidad
- Contraste mejorado
- Navegación por teclado
- Screen reader friendly

### 5. Performance
- CSS optimizado
- Componentes ligeros
- Animaciones GPU-accelerated

## 📋 Checklist de Calidad

### ✅ Completado
- [x] Sistema de variables CSS
- [x] Componentes UI reutilizables
- [x] Layouts responsive
- [x] Estados interactivos
- [x] Mensajes de error/éxito
- [x] Indicadores de estado
- [x] Sistema de toasts

### 🎯 Objetivos Alcanzados
- [x] Diseño corporativo profesional
- [x] Experiencia de usuario moderna
- [x] Consistencia visual completa
- [x] Accesibilidad WCAG AA
- [x] Performance optimizada

## 🔮 Próximos Pasos

1. **Testing de Usuario**: Validar la experiencia real
2. **Performance Testing**: Medir tiempos de carga
3. **Cross-browser Testing**: Compatibilidad con navegadores
4. **Documentación API**: Guía para desarrolladores
5. **Component Library**: Publicar componentes reutilizables

---

Este sistema de diseño proporciona una base sólida para el crecimiento futuro de la aplicación, manteniendo consistencia y calidad en todas las interacciones del usuario.
