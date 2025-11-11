import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UnauthorizedMessage } from "@/components/unauthorized-message";
import ModifyLinksTable from "@/components/modify-links-table";
import { env } from "@/config/envs";

// Obtener lista de usuarios permitidos desde variables de entorno
function getAllowedUsers(): string[] {
  const allowedUsersEnv = env.ALLOWED_USERS;
  if (!allowedUsersEnv) {
    console.warn(
      "ALLOWED_USERS no está configurado en las variables de entorno",
    );
    return [];
  }
  return allowedUsersEnv
    .split(",")
    .map((user) => user.trim())
    .filter(Boolean);
}

export default async function ModifyLink() {
  // Verificar autenticación en el servidor
  const { userId } = await auth();

  // Si no está autenticado, redirigir al login
  if (!userId) {
    redirect("/sign-in");
  }

  // Obtener datos del usuario actual
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Verificar autorización
  const allowedUsers = getAllowedUsers();
  const userEmail = user.primaryEmailAddress?.emailAddress;

  const isAuthorized =
    allowedUsers.includes(user.id) ||
    (userEmail && allowedUsers.includes(userEmail));

  if (!isAuthorized) {
    return <UnauthorizedMessage />;
  }

  // Si está autenticado y autorizado, mostrar la tabla de links
  return <ModifyLinksTable />;
}
