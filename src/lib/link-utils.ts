// src/lib/link-utils.ts
export type LinkItem = {
  id: string;
  name: string;
  url: string;
  description: string;
  rating: number;
  dateAdded: string;
  categoryId: string;
  categoryName: string;
};

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
