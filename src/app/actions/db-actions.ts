"use server";

import { turso } from "@/lib/turso";
import { revalidatePath } from "next/cache";

export type LinkType = {
  id: string;
  name: string;
  description: string;
  url: string;
  categoryId: string;
  categoryName: string;
  rating: number;
  dateAdded: string;
  faviconUrl?: string;
};

export type Category = {
  id: string;
  name: string;
};

// Inicializar las tablas
export async function initializeTables() {
  try {
    // Crear tabla de categorías
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);

    // Crear tabla de links
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT NOT NULL,
        category_id TEXT NOT NULL,
        rating REAL NOT NULL DEFAULT 0,
        date_added TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Crear índices para mejorar el rendimiento
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_links_category ON links(category_id)
    `);

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_links_rating ON links(rating)
    `);

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_links_date ON links(date_added)
    `);

    return { success: true, message: "Tablas inicializadas correctamente" };
  } catch (error) {
    console.error("Error inicializando tablas:", error);
    return { success: false, message: "Error al inicializar las tablas" };
  }
}

// Obtener todas las categorías
export async function getCategories(): Promise<Category[]> {
  try {
    const result = await turso.execute(
      "SELECT * FROM categories ORDER BY name",
    );
    return result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
    }));
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    return [];
  }
}

export type LinkItem = {
  id: string;
  name: string;
  url: string;
  description: string;
  rating: number;
  dateAdded: string;
  categoryId: string;
  categoryName: string;
  faviconUrl?: string;
};

export async function getLinksStart(): Promise<LinkItem[]> {
  const result = await turso.execute(`
    SELECT l.*, c.name AS categoryName
    FROM links l
    INNER JOIN categories c ON l.category_id = c.id
  `);
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    url: String(row.url ?? ""),
    dateAdded: String(row.date_added ?? ""),
    rating: Number(row.rating ?? 0),
    categoryId: String(row.category_id ?? ""),
    categoryName: String(row.categoryName ?? ""),
    faviconUrl: row.favicon_url ? String(row.favicon_url) : undefined,
  }));
}

// Obtener links con filtros y paginación
export async function getLinks(options: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  categoryIds?: string[];
  sortBy?: "name" | "date" | "category" | "rating";
}): Promise<{ links: LinkType[]; total: number }> {
  try {
    const {
      page = 1,
      limit = 12,
      searchQuery = "",
      categoryIds = [],
      sortBy = "name",
    } = options;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: (string | number)[] = [];

    // Filtro de búsqueda
    if (searchQuery) {
      whereClause += ` AND (l.name LIKE ? OR l.description LIKE ?)`;
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    // Filtro de categorías
    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => "?").join(",");
      whereClause += ` AND l.category_id IN (${placeholders})`;
      params.push(...categoryIds);
    }

    // Ordenamiento
    let orderClause = "";
    switch (sortBy) {
      case "name":
        orderClause = "ORDER BY l.name ASC";
        break;
      case "date":
        orderClause = "ORDER BY l.date_added DESC";
        break;
      case "category":
        orderClause = "ORDER BY c.name ASC";
        break;
      case "rating":
        orderClause = "ORDER BY l.rating DESC";
        break;
    }

    // Consulta para obtener los links
    const query = `
      SELECT
        l.id,
        l.name,
        l.description,
        l.url,
        l.favicon_url,
        l.category_id as categoryId,
        c.name as categoryName,
        l.rating,
        l.date_added as dateAdded
      FROM links l
      JOIN categories c ON l.category_id = c.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const result = await turso.execute({
      sql: query,
      args: params,
    });

    // Consulta para obtener el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM links l
      ${whereClause}
    `;

    const countResult = await turso.execute({
      sql: countQuery,
      args: params.slice(0, -2), // Remover limit y offset
    });

    const total = (countResult.rows[0]?.total as number) || 0;

    const links: LinkType[] = result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      url: row.url as string,
      categoryId: row.categoryId as string,
      categoryName: row.categoryName as string,
      rating: row.rating as number,
      dateAdded: row.dateAdded as string,
      faviconUrl: row.favicon_url ? String(row.favicon_url) : undefined,
    }));

    return { links, total };
  } catch (error) {
    console.error("Error obteniendo links:", error);
    return { links: [], total: 0 };
  }
}

// Crear un nuevo link
export async function createLink(data: {
  name: string;
  description: string;
  url: string;
  categoryId: string;
  rating: number;
  faviconUrl?: string;
}) {
  try {
    const id = `link_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const dateAdded = new Date().toISOString().split("T")[0];

    // Generar favicon_url automáticamente si no se proporciona
    let faviconUrl = data.faviconUrl;
    if (!faviconUrl) {
      try {
        const hostname = new URL(data.url).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${hostname}`;
      } catch {
        // Si la URL no es válida, usar un favicon genérico
        faviconUrl =
          "https://www.google.com/s2/favicons?sz=64&domain_url=example.com";
      }
    }

    await turso.execute({
      sql: `
        INSERT INTO links (id, name, description, url, favicon_url, category_id, rating, date_added)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        data.name,
        data.description,
        data.url,
        faviconUrl,
        data.categoryId,
        data.rating,
        dateAdded,
      ],
    });

    revalidatePath("/");
    return { success: true, message: "Link creado correctamente", id };
  } catch (error) {
    console.error("Error creando link:", error);
    return { success: false, message: "Error al crear el link" };
  }
}

// Sembrar datos iniciales (migración de datos del JSON) - COMENTADA
// export async function seedInitialData() {
//   try {
//     const { categories } = await import("@/data/links");

//     // Insertar categorías
//     for (const category of categories) {
//       await turso.execute({
//         sql: "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
//         args: [category.id, category.name],
//       });

//       // Insertar links de cada categoría
//       for (const link of category.links) {
//         await turso.execute({
//           sql: `
//             INSERT OR IGNORE INTO links (id, name, description, url, category_id, rating, date_added)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//           `,
//           args: [
//             link.id,
//             link.name,
//             link.description,
//             link.url,
//             category.id,
//             link.rating,
//             link.dateAdded,
//           ],
//         });
//       }
//     }

//     return {
//       success: true,
//       message: "Datos iniciales sembrados correctamente",
//     };
//   } catch (error) {
//     console.error("Error sembrando datos:", error);
//     return { success: false, message: "Error al sembrar los datos" };
//   }
// }

// ========== NUEVAS FUNCIONES PARA CRUD DE LINKS ==========

// Obtener un link por ID
export async function getLinkById(id: string): Promise<LinkType | null> {
  try {
    const result = await turso.execute({
      sql: `
        SELECT
          l.id,
          l.name,
          l.description,
          l.url,
          l.favicon_url,
          l.category_id as categoryId,
          c.name as categoryName,
          l.rating,
          l.date_added as dateAdded
        FROM links l
        JOIN categories c ON l.category_id = c.id
        WHERE l.id = ?
      `,
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      url: row.url as string,
      categoryId: row.categoryId as string,
      categoryName: row.categoryName as string,
      rating: row.rating as number,
      dateAdded: row.dateAdded as string,
      faviconUrl: row.favicon_url ? String(row.favicon_url) : undefined,
    };
  } catch (error) {
    console.error("Error obteniendo link por ID:", error);
    return null;
  }
}

// Actualizar un link
export async function updateLink(
  id: string,
  data: {
    name?: string;
    url?: string;
    description?: string;
    categoryId?: string;
    rating?: number;
    faviconUrl?: string;
  },
) {
  try {
    const updates: string[] = [];
    const args: (string | number)[] = [];

    // Construir dinámicamente la query de UPDATE
    if (data.name !== undefined) {
      updates.push("name = ?");
      args.push(data.name);
    }
    if (data.url !== undefined) {
      updates.push("url = ?");
      args.push(data.url);

      // Si se actualiza la URL y no se proporciona faviconUrl, generar uno nuevo
      if (data.faviconUrl === undefined) {
        try {
          const hostname = new URL(data.url).hostname;
          const autoFaviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${hostname}`;
          updates.push("favicon_url = ?");
          args.push(autoFaviconUrl);
        } catch {
          // Si la URL no es válida, usar un favicon genérico
          updates.push("favicon_url = ?");
          args.push(
            "https://www.google.com/s2/favicons?sz=64&domain_url=example.com",
          );
        }
      }
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      args.push(data.description);
    }
    if (data.categoryId !== undefined) {
      updates.push("category_id = ?");
      args.push(data.categoryId);
    }
    if (data.rating !== undefined) {
      updates.push("rating = ?");
      args.push(data.rating);
    }
    if (data.faviconUrl !== undefined) {
      updates.push("favicon_url = ?");
      args.push(data.faviconUrl);
    }

    if (updates.length === 0) {
      return { success: false, message: "No hay campos para actualizar" };
    }

    args.push(id); // ID va al final para la cláusula WHERE

    await turso.execute({
      sql: `UPDATE links SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    revalidatePath("/");
    revalidatePath("/modify-link");
    return { success: true, message: "Link actualizado correctamente" };
  } catch (error) {
    console.error("Error actualizando link:", error);
    return { success: false, message: "Error al actualizar el link" };
  }
}

// Eliminar un link
export async function deleteLink(id: string) {
  try {
    const result = await turso.execute({
      sql: "DELETE FROM links WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return { success: false, message: "Link no encontrado" };
    }

    revalidatePath("/");
    revalidatePath("/modify-link");
    return { success: true, message: "Link eliminado correctamente" };
  } catch (error) {
    console.error("Error eliminando link:", error);
    return { success: false, message: "Error al eliminar el link" };
  }
}
