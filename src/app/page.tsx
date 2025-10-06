"use client";

import { Chip } from "@heroui/chip";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Card, Image, Link } from "@heroui/react";
import { ChevronDown, ExternalLink, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatedCard } from "@/components/animated-card";
// import { InfiniteScroll } from '@/components/infinite-scroll';
import { CategoryFilter } from "@/components/category-filter";
import { ThemeToggle } from "@/components/theme-toggle";
// import { StarRating } from '@/components/star-rating';

import {
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from "@heroui/react";
import { StarRating } from "@/components/star-rating";
import { allLinks } from "../data/links";

export default function Home() {
  const [sortOrder, setSortOrder] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleLinks, setVisibleLinks] = useState<typeof allLinks>([]);
  const [page, setPage] = useState(1);
  const linksPerPage = 12;

  // Memoize filtered links to prevent recalculation on every render
  const filteredLinks = useMemo(() => {
    return allLinks
      .filter(
        (link) =>
          (selectedCategories.length === 0 ||
            selectedCategories.includes(link.categoryId)) &&
          (link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .sort((a, b) => {
        if (sortOrder === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortOrder === "date") {
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
        } else if (sortOrder === "category") {
          return a.categoryName.localeCompare(b.categoryName);
        } else if (sortOrder === "rating") {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [searchQuery, sortOrder, selectedCategories]);

  // Load initial links only once
  useEffect(() => {
    setIsLoaded(true);
    setVisibleLinks(filteredLinks.slice(0, linksPerPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intencionalmente vacío para ejecutar solo una vez

  // Update visible links when filters change
  useEffect(() => {
    setPage(1);
    setVisibleLinks(filteredLinks.slice(0, linksPerPage));
  }, [filteredLinks, linksPerPage]);

  // Load more links
  const loadMoreLinks = useCallback(() => {
    const nextPage = page + 1;
    const startIndex = page * linksPerPage;
    const endIndex = nextPage * linksPerPage;
    const newLinks = filteredLinks.slice(startIndex, endIndex);

    if (newLinks.length > 0) {
      setVisibleLinks((prev) => [...prev, ...newLinks]);
      setPage(nextPage);
    }
  }, [page, filteredLinks, linksPerPage]);

  // Memoize the category change handler
  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header
          className={`mb-4 text-center relative transition-all duration-700 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
            Colección de Enlaces Favoritos
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Una colección personal de sitios web útiles e interesantes
          </p>
        </header>

        {/* Category filter */}
        <CategoryFilter
          selectedCategories={selectedCategories}
          onChange={handleCategoryChange}
        />

        <div
          className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-700 delay-300 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="relative w-full sm:max-w-md">
            <Input
              type="search"
              placeholder="Buscar enlaces por nombre o descripción..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              endContent={<Search />}
            />
          </div>

          <div className="flex items-center">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="solid" className="w-full sm:w-auto">
                  Ordenar por:{" "}
                  {sortOrder === "name"
                    ? "Nombre"
                    : sortOrder === "date"
                      ? "Fecha"
                      : sortOrder === "category"
                        ? "Categoría"
                        : "Popularidad"}
                  {/* <ChevronDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </DropdownTrigger>

              <DropdownMenu>
                <DropdownItem key="name" onClick={() => setSortOrder("name")}>
                  Nombre
                </DropdownItem>
                <DropdownItem key="date" onClick={() => setSortOrder("date")}>
                  Fecha añadida
                </DropdownItem>
                <DropdownItem
                  key="category"
                  onClick={() => setSortOrder("category")}
                >
                  Categoría
                </DropdownItem>
                <DropdownItem
                  key="rating"
                  onClick={() => setSortOrder("rating")}
                >
                  Popularidad
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* All links in a grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLinks.map((link, index) => (
            <AnimatedCard key={link.id} index={index % linksPerPage}>
              <LinkCardContent link={link} categoryName={link.categoryName} />
            </AnimatedCard>
          ))}
        </div>

        {/* Infinite scroll loader - Only render when needed */}
        {/* {visibleLinks.length > 0 &&
          visibleLinks.length < filteredLinks.length && (
            <InfiniteScroll
              onLoadMore={loadMoreLinks}
              hasMore={visibleLinks.length < filteredLinks.length}
              className="mt-4"
            />
          )} */}
      </div>
    </main>
  );
}

function LinkCardContent({
  link,
  categoryName,
}: {
  link: (typeof allLinks)[0];
  categoryName: string;
}) {
  return (
    <>
      <CardHeader className="flex gap-3 dark:text-white text-red-200">
        <Image
          alt="heroui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md">{link.name}</p>
          <p className="text-small text-default-500">
            {link.name.toLocaleLowerCase().replace(" ", "-")}.com
          </p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody>
        <p>{link.description}</p>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-between pt-2">
        <Chip className="select-none cursor-default">{categoryName}</Chip>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => window.open(link.url, "_blank")}
          className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          Visitar
        </Button>
      </CardFooter>
    </>
  );
}
