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

export async function getLinksStart() {
  const result = await turso.execute(`
    SELECT l.*, c.name AS categoryName
    FROM links l
    INNER JOIN categories c ON l.category_id = c.id
  `);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    dateAdded: row.date_added,
    rating: row.rating,
    categoryId: row.category_id,
    categoryName: row.categoryName,
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
    const params: any[] = [];

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
}) {
  try {
    const id = `link_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const dateAdded = new Date().toISOString().split("T")[0];

    await turso.execute({
      sql: `
        INSERT INTO links (id, name, description, url, category_id, rating, date_added)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        data.name,
        data.description,
        data.url,
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

// Sembrar datos iniciales (migración de datos del JSON)
export async function seedInitialData() {
  try {
    const { categories } = await import("@/data/links");

    // Insertar categorías
    for (const category of categories) {
      await turso.execute({
        sql: "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
        args: [category.id, category.name],
      });

      // Insertar links de cada categoría
      for (const link of category.links) {
        await turso.execute({
          sql: `
            INSERT OR IGNORE INTO links (id, name, description, url, category_id, rating, date_added)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            link.id,
            link.name,
            link.description,
            link.url,
            category.id,
            link.rating,
            link.dateAdded,
          ],
        });
      }
    }

    return {
      success: true,
      message: "Datos iniciales sembrados correctamente",
    };
  } catch (error) {
    console.error("Error sembrando datos:", error);
    return { success: false, message: "Error al sembrar los datos" };
  }
}
