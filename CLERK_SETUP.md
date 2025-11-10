# Configuración de Clerk para autenticación

Este proyecto ha sido integrado con Clerk para autenticar y autorizar el acceso
a la página de creación de enlaces.

## Configuración requerida

1. **Crear cuenta en Clerk**: Ve a [clerk.com](https://clerk.com) y crea una
   cuenta.

2. **Crear una aplicación**: Una vez en el dashboard de Clerk, crea una nueva
   aplicación.

3. **Obtener las claves**: En el dashboard, ve a "API Keys" y copia:

   - Publishable key
   - Secret key

4. **Configurar variables de entorno**: Edita el archivo `.env.local` en la raíz
   del proyecto:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_publishable_key_aqui
CLERK_SECRET_KEY=sk_test_tu_secret_key_aqui

# URLs de Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

5. **Configurar usuarios permitidos**: En `src/app/create-new-link/page.tsx`,
   edita la constante `allowedUsers`:

```typescript
const allowedUsers = [
  "user_2pQKxxxxxxxxxxxxxxxxxxx", // Reemplaza con tu ID de usuario de Clerk
  "tu-email@ejemplo.com", // O usa tu email
];
```

## Cómo obtener tu ID de usuario

1. Una vez que hayas configurado las claves y ejecutado la aplicación
2. Accede a `/user-profile` para ver tu perfil
3. En el código, puedes hacer `console.log(user.id)` para ver tu ID
4. Agrega ese ID a la lista de `allowedUsers`

## Funcionalidad

- **Página protegida**: Solo `/create-new-link` está protegida
- **Autenticación automática**: Si no estás autenticado, serás redirigido al
  login
- **Lista de usuarios permitidos**: Solo los usuarios en la lista pueden acceder
- **Mensaje de no autorizado**: Si el usuario no está permitido, ve un mensaje
  centrado
- **UI intacta**: Toda la UI original se mantiene igual

## Rutas disponibles

- `/sign-in` - Página de inicio de sesión de Clerk
- `/sign-up` - Página de registro de Clerk
- `/user-profile` - Perfil de usuario de Clerk
- `/create-new-link` - Página protegida para crear enlaces
