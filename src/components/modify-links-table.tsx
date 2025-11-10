"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";

import {
  getLinksStart,
  getLinkById,
  updateLink,
  deleteLink,
  getCategories,
  type LinkType,
  type Category,
} from "@/app/actions/db-actions";

type EditFormData = {
  name: string;
  url: string;
  description: string;
  categoryId: string;
  rating: number;
};

export default function ModifyLinksTable() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modales
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // Form para editar
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFormData>();

  const selectedCategory = watch("categoryId");

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [linksData, categoriesData] = await Promise.all([
        getLinksStart(),
        getCategories(),
      ]);
      setLinks(linksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Abrir modal de edición
  const handleEditClick = async (linkId: string) => {
    try {
      const linkData = await getLinkById(linkId);
      if (linkData) {
        setSelectedLink(linkData);
        // Llenar el formulario con los datos actuales
        setValue("name", linkData.name);
        setValue("url", linkData.url);
        setValue("description", linkData.description);
        setValue("categoryId", linkData.categoryId);
        setValue("rating", linkData.rating);
        onEditOpen();
      }
    } catch (error) {
      console.error("Error cargando link:", error);
    }
  };

  // Abrir modal de eliminación
  const handleDeleteClick = (link: LinkType) => {
    setSelectedLink(link);
    onDeleteOpen();
  };

  // Enviar formulario de edición
  const onSubmitEdit = async (data: EditFormData) => {
    if (!selectedLink) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateLink(selectedLink.id, {
        name: data.name,
        url: data.url,
        description: data.description,
        categoryId: data.categoryId,
        rating: data.rating,
      });

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        await loadData(); // Recargar datos
        setTimeout(() => {
          onEditClose();
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch {
      setMessage({ type: "error", text: "Error inesperado al actualizar" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador para el botón del modal
  const handleSaveClick = () => {
    handleSubmit(onSubmitEdit)();
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedLink) return;

    setIsSubmitting(true);

    try {
      const result = await deleteLink(selectedLink.id);

      if (result.success) {
        await loadData(); // Recargar datos
        onDeleteClose();
      } else {
        console.error("Error eliminando:", result.message);
      }
    } catch (error) {
      console.error("Error eliminando:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpiar formulario al cerrar modal
  const handleEditClose = () => {
    reset();
    setSelectedLink(null);
    setMessage(null);
    onEditClose();
  };

  const handleDeleteClose = () => {
    setSelectedLink(null);
    onDeleteClose();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando links...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Button>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Modificar Links
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Panel administrativo para gestionar tu colección de enlaces
          </p>
        </div>

        {/* Tabla */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-semibold">Lista de Links</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Total: {links.length} enlaces
            </p>
          </CardHeader>
          <CardBody>
            <Table aria-label="Tabla de links">
              <TableHeader>
                <TableColumn>NOMBRE</TableColumn>
                <TableColumn>URL</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn>CATEGORÍA</TableColumn>
                <TableColumn>RATING</TableColumn>
                <TableColumn>FECHA</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No hay links para mostrar">
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.name}</TableCell>
                    <TableCell>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {link.url.length > 40
                          ? `${link.url.substring(0, 40)}...`
                          : link.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {link.description.length > 60
                          ? `${link.description.substring(0, 60)}...`
                          : link.description}
                      </div>
                    </TableCell>
                    <TableCell>{link.categoryName}</TableCell>
                    <TableCell>{link.rating.toFixed(1)}</TableCell>
                    <TableCell>{link.dateAdded}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleEditClick(link.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleDeleteClick(link)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Modal de Edición */}
      <Modal isOpen={isEditOpen} onClose={handleEditClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Editar Link: {selectedLink?.name}
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-name"
                  placeholder="Nombre del enlace"
                  {...register("name", {
                    required: "El nombre es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label htmlFor="edit-url" className="text-sm font-medium">
                  URL <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-url"
                  type="url"
                  placeholder="https://ejemplo.com"
                  {...register("url", {
                    required: "La URL es requerida",
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Debe ser una URL válida",
                    },
                  })}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium"
                >
                  Descripción <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="edit-description"
                  placeholder="Descripción del enlace"
                  rows={3}
                  {...register("description", {
                    required: "La descripción es requerida",
                    minLength: {
                      value: 10,
                      message: "Mínimo 10 caracteres",
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Selecciona una categoría"
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    setValue("categoryId", selected as string);
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
                <label htmlFor="edit-rating" className="text-sm font-medium">
                  Valoración <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.5"
                  {...register("rating", {
                    required: "La valoración es requerida",
                    min: { value: 0, message: "Mínimo 0" },
                    max: { value: 5, message: "Máximo 5" },
                    valueAsNumber: true,
                  })}
                />
                {errors.rating && (
                  <p className="text-sm text-red-500">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              {/* Mensaje */}
              {message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleEditClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleSaveClick}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal isOpen={isDeleteOpen} onClose={handleDeleteClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar eliminación
          </ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que quieres eliminar el link{" "}
              <strong>{selectedLink?.name}</strong>?
            </p>
            <p className="text-sm text-slate-500">
              Esta acción no se puede deshacer.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleDeleteClose}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
