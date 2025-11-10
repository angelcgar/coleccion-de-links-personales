"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import { Home, Plus, Edit3, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();

  // No mostrar navbar si el usuario no está autenticado
  if (!isSignedIn) {
    return null;
  }

  // Helper para determinar si un enlace está activo
  const isActivePath = (path: string) => pathname === path;

  return (
    <HeroNavbar isBordered className="w-full">
      <NavbarBrand>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <p className="font-bold text-inherit">Links Collection</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActivePath("/")
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/create-new-link"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActivePath("/create-new-link")
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Plus className="h-4 w-4" />
            Crear Link
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/modify-link"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActivePath("/modify-link")
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Modificar Links
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              size="sm"
              src={user?.imageUrl}
              name={user?.firstName || user?.username || "Usuario"}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Sesión iniciada como</p>
              <p className="font-semibold">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </DropdownItem>
            <DropdownItem
              key="profile_page"
              startContent={<User className="h-4 w-4" />}
            >
              <Link href="/user-profile">Mi Perfil</Link>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<LogOut className="h-4 w-4" />}
            >
              <SignOutButton>Cerrar Sesión</SignOutButton>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      {/* Versión móvil - Enlaces horizontales */}
      <NavbarContent className="sm:hidden flex w-full mt-2" justify="center">
        <div className="flex gap-2 w-full justify-around">
          <NavbarItem>
            <Link href="/">
              <Button
                variant={isActivePath("/") ? "solid" : "light"}
                color={isActivePath("/") ? "primary" : "default"}
                size="sm"
                startContent={<Home className="h-4 w-4" />}
              >
                Home
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/create-new-link">
              <Button
                variant={isActivePath("/create-new-link") ? "solid" : "light"}
                color={isActivePath("/create-new-link") ? "primary" : "default"}
                size="sm"
                startContent={<Plus className="h-4 w-4" />}
              >
                Crear
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/modify-link">
              <Button
                variant={isActivePath("/modify-link") ? "solid" : "light"}
                color={isActivePath("/modify-link") ? "primary" : "default"}
                size="sm"
                startContent={<Edit3 className="h-4 w-4" />}
              >
                Modificar
              </Button>
            </Link>
          </NavbarItem>
        </div>
      </NavbarContent>
    </HeroNavbar>
  );
}
