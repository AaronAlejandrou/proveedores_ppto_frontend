# Proveedores PPTO - Frontend

Frontend para el panel administrativo y el portal público de proveedores (órdenes de compra, magic links, carga de documentos).

## Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- PrimeVue (librería UI)
- Axios

## Requisitos

- Node.js 20+
- Backend con API en `http://localhost:8000/api/v1` (o la URL base que defina `VITE_API_BASE_URL`)

## Configuración local

1. Instalar dependencias.
2. Copiar `.env.example` a `.env`.
3. Ajustar `VITE_API_BASE_URL` si usas otro host o puerto; en local coherente con el backend: **`http://localhost:8000/api/v1`**

```powershell
npm install
Copy-Item .env.example .env
```

## Ejecutar en desarrollo

```powershell
npm run dev
```

## Build de producción

```powershell
npm run build
```

## Flujo de prueba completo (MVP)

### 1. Acceso administrativo
1. Navegar a `http://localhost:5173/admin/login`
2. Hacer clic en "Ingresar al panel MVP"
3. Será redirigido al dashboard principal

### 2. Crear proveedor
1. Desde el dashboard, "Nuevo Proveedor"
2. RUC (11 dígitos), razón social, email, demás según el formulario
3. Guardar y ver en listado

### 3. Crear orden de compra
1. "Nueva Orden de Compra"
2. Número de OC, proveedor, monto, moneda, fecha de emisión, etc.
3. Guardar

### 4. Generar magic link
1. En el detalle de la OC, "Acceso del Proveedor"
2. "Generar Magic Link"
3. Copiar o abrir en nueva pestaña

### 5. Acceso del proveedor (`/p/:token`)
1. El asistente valida el token y muestra la OC
2. Subir XML, PDF; CDR opcional; tipo, moneda y monto
3. Enviar; se usa `POST .../submission-with-files` (multipart, sin fijar `Content-Type` manual: el cliente envía el boundary)

### 6. Ver en admin
1. Volver al detalle de la OC: deben listarse las submissions
2. Opcional: consultar un submission por su id si se usa la ruta de detalle

## Rutas (resumen)

- **Admin:** `/admin/login`, `/admin/dashboard`, `/admin/providers`, `/admin/purchase-orders`, detalle con magic link, etc.
- **Público proveedor:** `/p/:token`

## Limitaciones (MVP)

- Login admin sin credenciales reales
- Sin toasts de error unificados en todos los flujos
- CORS y URL base: deben coincidir con `CORS_ALLOW_ORIGINS` y `VITE_API_BASE_URL` en el backend

## Identidad visual

Variables en `src/styles/variables.css` (p. ej. `--color-primary`, `--color-secondary`). PrimeVue se configura en `src/main.ts`.

## Estructura

```
src/
├── components/common/
├── services/       # Axios: base `VITE_API_BASE_URL` → p.ej. `/providers`, `/public/access/...`
├── types/
├── views/
│   ├── admin/
│   └── provider/
├── layouts/
└── styles/
```
