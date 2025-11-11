// src/lib/link-utils.ts
import type { LinkItem } from "@/app/actions/db-actions";

export type SortOrder = "name" | "date" | "category" | "rating";

/**
 * Filtra y ordena los enlaces según búsqueda, categoría y orden seleccionado.
 */
export function filterAndSortLinks(
  links: LinkItem[],
  searchQuery: string,
  selectedCategories: string[],
  sortOrder: SortOrder,
): LinkItem[] {
  const query = searchQuery.toLowerCase();

  const filtered = links.filter(
    (link) =>
      (selectedCategories.length === 0 ||
        selectedCategories.includes(link.categoryId)) &&
      (link.name.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query)),
  );

  return filtered.sort((a, b) => {
    switch (sortOrder) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return (
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
      case "category":
        return a.categoryName.localeCompare(b.categoryName);
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
}
