"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Chip } from "@heroui/chip";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import {
  Image,
  Button,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from "@heroui/react";
import { ExternalLink, Search } from "lucide-react";
import { AnimatedCard } from "@/components/animated-card";
import { CategoryFilter } from "@/components/category-filter";
import { ThemeToggle } from "@/components/theme-toggle";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { getLinksStart } from "./actions/db-actions";
import {
  filterAndSortLinks,
  type LinkItem,
  type SortOrder,
} from "@/lib/link-utils";

export default function Home() {
  const [sortOrder, setSortOrder] = useState<SortOrder>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [allLinks, setAllLinks] = useState<unknown[]>([]);
  const [visibleLinks, setVisibleLinks] = useState<unknown[]>([]);
  const [page, setPage] = useState(1);
  const linksPerPage = 12;

  const filteredLinks = useMemo(
    () =>
      filterAndSortLinks(
        allLinks as LinkItem[],
        searchQuery,
        selectedCategories,
        sortOrder,
      ),
    [allLinks, searchQuery, selectedCategories, sortOrder],
  );

  // Carga inicial desde la DB
  useEffect(() => {
    (async () => {
      const links = await getLinksStart();
      setAllLinks(links);
      setVisibleLinks(links);
      setIsLoaded(true);
    })();
  }, []);

  // Actualiza los visibles cuando cambian los filtros
  useEffect(() => {
    setPage(1);
    setVisibleLinks(filteredLinks.slice(0, linksPerPage));
  }, [filteredLinks]);

  const loadMoreLinks = useCallback(() => {
    const nextPage = page + 1;
    const startIndex = page * linksPerPage;
    const endIndex = nextPage * linksPerPage;
    const newLinks = filteredLinks.slice(startIndex, endIndex);

    if (newLinks.length > 0) {
      setVisibleLinks((prev) => [...prev, ...newLinks]);
      setPage(nextPage);
    }
  }, [page, filteredLinks]);

  const handleCategoryChange = useCallback(
    (categories: string[]) => setSelectedCategories(categories),
    [],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header
          className={`mb-4 text-center relative transition-all duration-700 ease-out ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="absolute left-0 top-0">
            <ThemeToggle />
          </div>
          <div className="absolute right-0 top-0">
            Resultados: {filteredLinks.length}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
            Colección de Enlaces Favoritos
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Una colección personal de sitios web útiles e interesantes
          </p>
        </header>

        <CategoryFilter
          selectedCategories={selectedCategories}
          onChange={handleCategoryChange}
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-700 delay-300 ease-out">
          <div className="relative w-full sm:max-w-md">
            <Input
              type="search"
              placeholder="Buscar enlaces..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              endContent={<Search />}
            />
          </div>

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
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key={"nombre"} onClick={() => setSortOrder("name")}>
                Nombre
              </DropdownItem>
              <DropdownItem key={"Fecha"} onClick={() => setSortOrder("date")}>
                Fecha
              </DropdownItem>
              <DropdownItem
                key={"Categoría"}
                onClick={() => setSortOrder("category")}
              >
                Categoría
              </DropdownItem>
              <DropdownItem
                key={"Popularidad"}
                onClick={() => setSortOrder("rating")}
              >
                Popularidad
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleLinks.map((link, index) => (
            <AnimatedCard key={link.id} index={index % linksPerPage}>
              <LinkCardContent link={link} />
            </AnimatedCard>
          ))}
        </div>

        {visibleLinks.length < filteredLinks.length && (
          <InfiniteScroll
            onLoadMore={loadMoreLinks}
            hasMore={true}
            className="mt-4"
          />
        )}
      </div>
    </main>
  );
}

function LinkCardContent({ link }: { link: LinkItem }) {
  return (
    <>
      <CardHeader className="flex gap-3 dark:text-white text-slate-900">
        <Image
          alt="logo"
          height={40}
          width={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
        />
        <div className="flex flex-col">
          <p className="text-md">{link.name}</p>
          <p className="text-small">{link.url.replace(/^https?:\/\//, "")}</p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="dark:text-white text-slate-900">
        <p>{link.description}</p>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-between pt-2">
        <Chip>{link.categoryName}</Chip>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => window.open(link.url, "_blank")}
          className="text-slate-700 dark:text-slate-300"
        >
          <ExternalLink className="h-4 w-4" /> Visitar
        </Button>
      </CardFooter>
    </>
  );
}
