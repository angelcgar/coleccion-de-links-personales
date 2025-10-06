"use client";

import { Card } from "@heroui/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface AnimatedCardProps {
  children: React.ReactNode;
  index: number;
}

export function AnimatedCard({ children, index }: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimatedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo animamos una vez para evitar problemas con re-renderizados
    if (!hasAnimatedRef.current) {
      timeoutRef.current = setTimeout(
        () => {
          setIsVisible(true);
          hasAnimatedRef.current = true;
        },
        100 + Math.min(index, 20) * 50,
      ); // Limitar el retraso máximo
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [index]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible || hasAnimatedRef.current
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <Card className="h-full transition-all hover:shadow-md dark:border-slate-700">
        {children}
      </Card>
    </div>
  );
}
