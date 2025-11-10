import { Card, CardBody } from "@heroui/react";

export function UnauthorizedMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardBody className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
            No autorizado
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            No tienes permisos para acceder a esta página.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
