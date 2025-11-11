"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Loader2 } from "lucide-react";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/react";

import { Card, CardBody, CardHeader } from "@heroui/react";

import {
  createLink,
  getCategories,
  type Category,
} from "@/app/actions/db-actions";

type FormData = {
  name: string;
  description: string;
  url: string;
  categoryId: string;
  rating: number;
  faviconUrl?: string;
};

export default function CreateNewLinkForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      rating: 4.0,
    },
  });

  const selectedCategory = watch("categoryId");

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log(data);
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await createLink(data);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        reset();

        // Redirigir a la página principal después de 2 segundos
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch {
      setMessage({ type: "error", text: "Error inesperado al crear el link" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Crear Nuevo Link
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Agrega un nuevo enlace a tu colección personal
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2>Información del Link</h2>
            <p>Completa todos los campos para agregar un nuevo enlace</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="Ej: GitHub"
                  {...register("name", {
                    required: "El nombre es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                    maxLength: {
                      value: 100,
                      message: "El nombre no puede exceder 100 caracteres",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label htmlFor="description">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  placeholder="Ej: Plataforma de desarrollo colaborativo"
                  rows={3}
                  {...register("description", {
                    required: "La descripción es requerida",
                    minLength: {
                      value: 10,
                      message:
                        "La descripción debe tener al menos 10 caracteres",
                    },
                    maxLength: {
                      value: 500,
                      message: "La descripción no puede exceder 500 caracteres",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label htmlFor="url">
                  URL <span className="text-red-500">*</span>
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://ejemplo.com"
                  {...register("url", {
                    required: "La URL es requerida",
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Debe ser una URL válida (http:// o https://)",
                    },
                  })}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url.message}</p>
                )}
              </div>

              {/* Favicon URL */}
              <div className="space-y-2">
                <label htmlFor="faviconUrl" className="text-sm font-medium">
                  URL del Favicon (opcional)
                </label>
                <Input
                  id="faviconUrl"
                  type="url"
                  placeholder="https://ejemplo.com/favicon.ico (se generará automáticamente si se deja vacío)"
                  {...register("faviconUrl", {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Debe ser una URL válida (http:// o https://)",
                    },
                  })}
                />
                {errors.faviconUrl && (
                  <p className="text-sm text-red-500">
                    {errors.faviconUrl.message}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Si no se proporciona, se generará automáticamente basado en la
                  URL del sitio
                </p>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label htmlFor="category">
                  Categoría <span className="text-red-500">*</span>
                </label>

                <Select
                  className="max-w-xs"
                  placeholder="Selecciona una categoría"
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    // React Hook Form: setea categoryId en el formulario
                    const event = {
                      target: { name: "categoryId", value: selected },
                    };
                    register("categoryId").onChange(event);
                  }}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id}>{category.name}</SelectItem>
                  ))}
                </Select>

                {errors.categoryId && (
                  <p className="text-sm text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label htmlFor="rating">
                  Valoración <span className="text-red-500">*</span>
                </label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.5"
                  {...register("rating", {
                    required: "La valoración es requerida",
                    min: {
                      value: 0,
                      message: "La valoración debe ser al menos 0",
                    },
                    max: {
                      value: 5,
                      message: "La valoración no puede exceder 5",
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.rating && (
                  <p className="text-sm text-red-500">
                    {errors.rating.message}
                  </p>
                )}
                <p className="text-sm text-slate-500">
                  Ingresa un valor entre 0 y 5 (ejemplo: 4.5)
                </p>
              </div>

              {/* Mensaje de estado */}
              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Creando..." : "Crear Link"}
                </Button>
                <Button type="button" variant="solid" onPress={() => reset()}>
                  Limpiar
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
