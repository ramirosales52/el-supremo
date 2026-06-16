# El Supremo - Carnicería Online

Sistema de tienda online para carnicería con pedidos personalizados.

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL
- **Frontend:** Vite + React + TailwindCSS

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm

## Setup

### 1. Base de datos

```bash
createdb elsupremo
# o desde psql:
# CREATE DATABASE elsupremo;
```

### 2. Backend

```bash
cd backend
npm install
# Configurar .env si es necesario (valores por defecto funcionan con PostgreSQL local)
npm run start:dev
```

### 3. Seed

Con el backend corriendo, en otra terminal:

```bash
cd backend
npm run seed
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Abrir

- **Tienda:** http://localhost:5173
- **Admin:** http://localhost:5173/admin

## Estructura

```
elsupremo/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── products/     # CRUD productos
│   │   │   ├── categories/   # CRUD categorías
│   │   │   ├── cut-options/  # CRUD opciones de corte
│   │   │   ├── orders/       # Pedidos + WebSocket
│   │   │   └── seed/         # Datos iniciales
│   │   ├── common/           # Filtros globales
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/              # Capa HTTP
│   │   ├── components/       # UI reutilizable
│   │   ├── context/          # Carrito (CartContext)
│   │   ├── hooks/            # WebSockets / polling
│   │   ├── pages/            # Shop, Checkout, Admin
│   │   └── types/            # TypeScript types
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Productos
- `GET /products` - Lista (pública, solo disponibles)
- `GET /products/admin` - Todos (para admin)
- `GET /products/:id` - Detalle
- `POST /products` - Crear
- `PATCH /products/:id` - Actualizar
- `DELETE /products/:id` - Eliminar

### Categorías
- `GET /categories` - Lista
- `POST /categories` - Crear
- `PATCH /categories/:id` - Actualizar
- `DELETE /categories/:id` - Eliminar

### Opciones de Corte
- `GET /cut-options` - Lista
- `POST /cut-options` - Crear
- `PATCH /cut-options/:id` - Actualizar
- `DELETE /cut-options/:id` - Eliminar

### Pedidos
- `GET /orders` - Lista (filtro opcional `?status=pending`)
- `GET /orders/:id` - Detalle
- `POST /orders` - Crear
- `PATCH /orders/:id/status` - Cambiar estado
- `DELETE /orders/:id` - Eliminar

### WebSocket
- `ws://localhost:3001/orders` - Eventos: `order:created`, `order:statusChanged`

## Flujo de usuario

1. Navegar productos por categoría
2. Seleccionar producto → ver opciones de corte disponibles
3. Elegir corte (milanesa, trozado, entero, picado, etc.)
4. Elegir cantidad (kg o unidades)
5. Agregar al carrito
6. Ir al checkout → completar datos → confirmar
7. El admin ve el pedido en tiempo real y cambia su estado
