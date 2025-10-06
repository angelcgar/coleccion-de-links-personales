"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="solid" size="md">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Static Actions">
        <DropdownItem
          className="dark:text-white text-slate-900"
          key="light"
          onClick={() => setTheme("light")}
        >
          Claro
        </DropdownItem>
        <DropdownItem
          className="dark:text-white text-slate-900"
          key="dark"
          onClick={() => setTheme("dark")}
        >
          Oscuro
        </DropdownItem>
        <DropdownItem
          className="dark:text-white text-slate-900"
          key="system"
          onClick={() => setTheme("system")}
        >
          Sistema
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
