# Environment Variables Configuration

Este proyecto utiliza `@t3-oss/env-nextjs` para el manejo seguro y tipado de
variables de entorno.

## Configuración

Las variables de entorno están definidas en `src/config/envs.ts` con validación
mediante Zod.

### Variables Requeridas

#### Server-side (solo disponibles en el servidor)

- `CLERK_SECRET_KEY`: Clave secreta de Clerk para autenticación
- `TURSO_DATABASE_URL`: URL de la base de datos Turso
- `TURSO_AUTH_TOKEN`: Token de autenticación para Turso
- `ALLOWED_USERS`: Lista de emails permitidos separados por comas

#### Client-side (disponibles en el cliente)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clave pública de Clerk

#### Opcionales

- `NEXT_PUBLIC_CLERK_FRONTEND_API`: API frontend de Clerk (solo para versiones
  antiguas de Clerk)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: URL personalizada para sign-in
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: URL personalizada para sign-up
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: URL de redirect después del sign-in
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: URL de redirect después del sign-up

## Uso

Importa las variables desde el archivo de configuración:

```typescript
import { env } from "@/config/envs";

// Uso de variables server-side
const dbUrl = env.TURSO_DATABASE_URL;

// Uso de variables client-side
const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
```

## Buenas Prácticas

1. **Nunca uses `process.env` directamente** - Siempre importa desde
   `@/config/envs`
2. **Variables server-side** están disponibles solo en componentes de servidor y
   API routes
3. **Variables client-side** (prefijo `NEXT_PUBLIC_`) están disponibles en
   cualquier lugar
4. **Validación automática** - Las variables se validan al iniciar la aplicación

## Ejemplo de .env.local

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
TURSO_DATABASE_URL=...
TURSO_AUTH_TOKEN=...

# Access Control
ALLOWED_USERS=email1@example.com,email2@example.com

# Optional Clerk URLs (uncomment if needed)
# NEXT_PUBLIC_CLERK_FRONTEND_API=... (only for legacy Clerk versions)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```
