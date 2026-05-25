# 🛒 CUCEI Market

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

🌐 **Demo en vivo:** [cucei-market.vercel.app](https://cucei-market.vercel.app)

**Plataforma de administración y catálogo de puestos comerciales del CUCEI, Universidad de Guadalajara.**

</div>

---

## 📌 Descripción

CUCEI Market es una aplicación web progresiva (PWA) que permite a vendedores del campus universitario registrar y administrar sus puestos comerciales, gestionar su catálogo de productos y recibir reseñas de los compradores. Los administradores cuentan con un panel de control completo para aprobar solicitudes de registro y gestionar el estado de los puestos.

---

## 👥 Equipo de desarrollo

| Nombre                 | Rol                    |
| ---------------------- | ---------------------- |
| José Luis Chávez Gómez | Tech Lead / Full Stack |
| Ricardo Arévalo García | Frontend Developer     |
| Francisco Rojas        | Backend Developer      |
| Neidelin Gálvez        | UI/UX & Frontend       |

---

## ✨ Funcionalidades

### 👤 Autenticación

- Registro de vendedores con validación de correo universitario (`@alumnos.udg.mx`, `@udg.mx`)
- Subida obligatoria de Kardex certificado en PDF para verificación
- Login con JWT y sesión persistente
- Roles diferenciados: `admin` y `vendedor`

### 🏪 Vendedor

- Registrar uno o múltiples puestos comerciales
- Gestionar catálogo de productos (agregar, editar, eliminar)
- Subida de imágenes por producto
- Selector de puesto activo al tener varios registrados
- Vista de estado del puesto (activo / inactivo / rechazado)

### 🔧 Administrador

- Panel de control con métricas en tiempo real
- Aprobar, rechazar o suspender cuentas de vendedores
- Verificación de Kardex en visor PDF integrado
- Aprobar, desactivar o rechazar puestos del campus
- Gestión de compradores

### 🏠 Catálogo Público

- Vista de todos los puestos activos del campus
- Búsqueda por nombre, categoría o ubicación
- Detalle de puesto con catálogo de productos
- Sistema de reseñas con calificación de 1 a 5 estrellas

---

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de **tres capas cliente-servidor**:

```
┌─────────────────────────────────────────┐
│           CLIENTE (React + Vite)        │
│  PWA · React Router · Context API       │
└──────────────────┬──────────────────────┘
                   │ HTTP REST (JSON)
┌──────────────────▼──────────────────────┐
│         SERVIDOR (Node.js + Express)    │
│  JWT · Multer · Bcrypt · CORS           │
└──────────────────┬──────────────────────┘
                   │ Supabase JS Client
┌──────────────────▼──────────────────────┐
│         BASE DE DATOS (Supabase)        │
│  PostgreSQL · Storage · RLS             │
└─────────────────────────────────────────┘
```

---

## 🗄️ Estructura de la base de datos

### Tabla `usuarios`

| Columna                | Tipo         | Descripción                                              |
| ---------------------- | ------------ | -------------------------------------------------------- |
| `id_usuario`           | BIGSERIAL PK | Identificador único                                      |
| `nombre_completo`      | TEXT         | Nombre del usuario                                       |
| `correo_institucional` | TEXT         | Correo universitario                                     |
| `contrasena`           | TEXT         | Hash bcrypt                                              |
| `rol`                  | TEXT         | `admin` \| `vendedor`                                    |
| `codigo_estudiante`    | TEXT         | Código de alumno                                         |
| `kardex_url`           | TEXT         | URL pública del PDF en Storage                           |
| `estado`               | TEXT         | `pendiente` \| `aprobado` \| `rechazado` \| `suspendido` |
| `razon_rechazo`        | TEXT         | Motivo de rechazo (opcional)                             |
| `fecha_registro`       | TIMESTAMPTZ  | Fecha de creación                                        |

### Tabla `puestos`

| Columna       | Tipo         | Descripción                           |
| ------------- | ------------ | ------------------------------------- |
| `id_puesto`   | BIGSERIAL PK | Identificador único                   |
| `vendedor_id` | BIGINT FK    | Referencia a `usuarios`               |
| `nombre`      | TEXT         | Nombre del puesto                     |
| `categoria`   | TEXT         | Comida, Bebidas, Papelería, etc.      |
| `ubicacion`   | TEXT         | Ubicación en el campus                |
| `horario`     | TEXT         | Horario de atención                   |
| `descripcion` | TEXT         | Descripción del puesto                |
| `estado`      | TEXT         | `activo` \| `inactivo` \| `rechazado` |

### Tabla `productos`

| Columna       | Tipo          | Descripción            |
| ------------- | ------------- | ---------------------- |
| `id_producto` | BIGSERIAL PK  | Identificador único    |
| `id_puesto`   | BIGINT FK     | Referencia a `puestos` |
| `nombre`      | TEXT          | Nombre del producto    |
| `precio`      | NUMERIC(10,2) | Precio en pesos        |
| `descripcion` | TEXT          | Descripción breve      |
| `disponible`  | BOOLEAN       | Disponibilidad         |
| `imagen_url`  | TEXT          | URL pública en Storage |
| `created_at`  | TIMESTAMPTZ   | Fecha de creación      |

### Tabla `reseñas`

| Columna        | Tipo         | Descripción             |
| -------------- | ------------ | ----------------------- |
| `id_resena`    | BIGSERIAL PK | Identificador único     |
| `id_puesto`    | BIGINT FK    | Referencia a `puestos`  |
| `id_usuario`   | BIGINT FK    | Referencia a `usuarios` |
| `calificacion` | SMALLINT     | 1 a 5 estrellas         |
| `comentario`   | TEXT         | Comentario opcional     |
| `created_at`   | TIMESTAMPTZ  | Fecha de creación       |

---

## 📁 Estructura del proyecto

```
CUCEI_MARKET/
├── client/                     # Frontend React + Vite
│   └── src/
│       ├── components/         # Componentes reutilizables
│       │   ├── Modal/
│       │   ├── Navbar/
│       │   ├── ProductCard/
│       │   └── StoreCard/
│       ├── context/
│       │   └── AuthContext.jsx # Manejo de sesión global
│       └── pages/
│           ├── Admin/          # Panel administrativo
│           ├── Auth/           # Login y Registro
│           ├── Home/           # Catálogo público
│           ├── Seller/         # Panel del vendedor
│           └── StoreDetails/   # Detalle de puesto
│
├── server/                     # Backend Node.js + Express
│   ├── config/
│   │   └── supabaseClient.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── storeController.js
│   ├── routes/
│   │   └── authRoutes.js
│   └── index.js
│
└── docs/                       # Documentación del proyecto
```

---

## ⚙️ Requisitos del sistema

### Software necesario

| Herramienta | Versión mínima             | Descarga                           |
| ----------- | -------------------------- | ---------------------------------- |
| Node.js     | 18.x o superior            | [nodejs.org](https://nodejs.org)   |
| npm         | 9.x o superior             | Incluido con Node.js               |
| Git         | Cualquier versión reciente | [git-scm.com](https://git-scm.com) |

### Servicios externos

- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Proyecto Supabase con las tablas y buckets configurados

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/realjoe23/CUCEI-MARKET
cd CUCEI_MARKET
```

### 2. Configurar el servidor

```bash
cd server
npm install
```

Crea el archivo `server/.env` con las siguientes variables:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
JWT_SECRET=tu_clave_secreta_jwt
PORT=3001
```

> Puedes obtener `SUPABASE_URL` y `SUPABASE_KEY` desde **Supabase → Project Settings → API**.

### 3. Configurar el cliente

```bash
cd ../client
npm install
```

### 4. Configurar Supabase

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase para crear las tablas:

```sql
-- Tabla de usuarios
CREATE TABLE usuarios (
  id_usuario           BIGSERIAL PRIMARY KEY,
  nombre_completo      TEXT NOT NULL,
  correo_institucional TEXT UNIQUE NOT NULL,
  contrasena           TEXT NOT NULL,
  rol                  TEXT DEFAULT 'vendedor',
  codigo_estudiante    TEXT,
  kardex_url           TEXT,
  estado               TEXT DEFAULT 'pendiente',
  razon_rechazo        TEXT,
  fecha_registro       TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de puestos
CREATE TABLE puestos (
  id_puesto   BIGSERIAL PRIMARY KEY,
  vendedor_id BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  categoria   TEXT,
  ubicacion   TEXT,
  horario     TEXT,
  descripcion TEXT,
  estado      TEXT DEFAULT 'inactivo'
);

-- Tabla de productos
CREATE TABLE productos (
  id_producto BIGSERIAL PRIMARY KEY,
  id_puesto   BIGINT REFERENCES puestos(id_puesto) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  precio      NUMERIC(10,2) NOT NULL,
  descripcion TEXT,
  disponible  BOOLEAN DEFAULT true,
  imagen_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reseñas
CREATE TABLE reseñas (
  id_resena    BIGSERIAL PRIMARY KEY,
  id_puesto    BIGINT REFERENCES puestos(id_puesto) ON DELETE CASCADE,
  id_usuario   BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  calificacion SMALLINT CHECK (calificacion BETWEEN 1 AND 5),
  comentario   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

Crea los buckets en **Supabase → Storage**:

- `kardex` — privado
- `productos` — público

Agrega las políticas de Storage ejecutando:

```sql
CREATE POLICY "Subida kardex" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'kardex');

CREATE POLICY "Lectura kardex" ON storage.objects
  FOR SELECT USING (bucket_id = 'kardex');

CREATE POLICY "Subida productos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'productos');

CREATE POLICY "Lectura productos" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos');
```

---

## ▶️ Ejecución

Necesitas **dos terminales** abiertas simultáneamente:

**Terminal 1 — Servidor:**

```bash
cd server
npm run dev
# Servidor corriendo en http://localhost:3001
```

**Terminal 2 — Cliente:**

```bash
cd client
npm run dev
# Aplicación en http://localhost:5173
```

---

## 📖 Mini manual de uso

### Registrarse como vendedor

1. Entra a la aplicación y haz clic en **"Crear cuenta"**
2. Llena tus datos con un correo universitario (`@alumnos.udg.mx`)
3. Sube tu **Kardex certificado en PDF** — es obligatorio
4. Tu cuenta quedará en estado **pendiente** hasta que el admin la apruebe

### Registrar un puesto

1. Una vez aprobada tu cuenta, inicia sesión y ve a **"Registrar puesto"**
2. Llena nombre, categoría, ubicación y horario
3. El puesto queda en estado **inactivo** hasta que el admin lo active

### Agregar productos

1. Ve a **"Mis productos"** desde tu panel de vendedor
2. Si tienes varios puestos, selecciona el deseado desde el selector
3. Haz clic en **"+ Agregar producto"**
4. Llena nombre, precio, descripción y sube una foto opcional

### Panel de administrador

1. Inicia sesión con una cuenta de rol `admin`
2. En **"Solicitudes"** aprueba o rechaza cuentas de vendedores verificando su Kardex
3. En **"Puestos"** activa o desactiva los puestos del campus
4. En **"Vendedores"** gestiona el estado de las cuentas aprobadas

### Ver el catálogo

- La página de inicio muestra todos los puestos **activos** del campus
- Usa el buscador para filtrar por nombre, categoría o ubicación
- Haz clic en cualquier puesto para ver su catálogo y reseñas
- Deja una reseña con calificación de estrellas si tienes sesión iniciada

---

## 🔌 API Endpoints

### Autenticación

| Método | Ruta            | Descripción             |
| ------ | --------------- | ----------------------- |
| POST   | `/api/register` | Registro con Kardex PDF |
| POST   | `/api/login`    | Login, devuelve JWT     |

### Puestos

| Método | Ruta                                | Descripción               |
| ------ | ----------------------------------- | ------------------------- |
| GET    | `/api/stores`                       | Todos los puestos activos |
| POST   | `/api/stores`                       | Registrar nuevo puesto    |
| GET    | `/api/stores/:id`                   | Detalle de un puesto      |
| GET    | `/api/stores/vendedor/:vendedor_id` | Puestos de un vendedor    |

### Productos

| Método | Ruta                       | Descripción            |
| ------ | -------------------------- | ---------------------- |
| GET    | `/api/stores/:id/products` | Productos de un puesto |
| POST   | `/api/products`            | Agregar producto       |
| PUT    | `/api/products/:id`        | Editar producto        |
| DELETE | `/api/products/:id`        | Eliminar producto      |

### Reseñas

| Método | Ruta                      | Descripción          |
| ------ | ------------------------- | -------------------- |
| GET    | `/api/stores/:id/reviews` | Reseñas de un puesto |
| POST   | `/api/stores/:id/reviews` | Publicar reseña      |

### Administrador

| Método | Ruta                           | Descripción               |
| ------ | ------------------------------ | ------------------------- |
| GET    | `/api/admin/users`             | Todos los usuarios        |
| PUT    | `/api/admin/users/:id/status`  | Cambiar estado de usuario |
| GET    | `/api/admin/stores`            | Todos los puestos         |
| PUT    | `/api/admin/stores/:id/status` | Cambiar estado de puesto  |

---

## 🛠️ Stack tecnológico

### Frontend

- **React 19** — Librería de UI
- **Vite 8** — Bundler y servidor de desarrollo
- **React Router DOM 7** — Enrutamiento SPA
- **Context API** — Manejo de estado global (sesión)

### Backend

- **Node.js + Express** — Servidor REST
- **Multer** — Manejo de archivos (PDF e imágenes)
- **Bcrypt** — Hash de contraseñas
- **JSON Web Token** — Autenticación stateless
- **Dotenv** — Variables de entorno

### Base de datos & Almacenamiento

- **Supabase (PostgreSQL)** — Base de datos relacional
- **Supabase Storage** — Almacenamiento de archivos (Kardex y fotos de productos)

---

## 📄 Licencia

Proyecto académico — Universidad de Guadalajara, CUCEI  
Ingeniería en Computación — Ingeniería de Software  
2024–2025
