"use client"

import { useEffect, useRef, useState } from "react"

interface InfiniteScrollProps {
  onLoadMore: () => void
  hasMore: boolean
  loadingText?: string
  className?: string
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  loadingText = "Cargando más enlaces...",
  className = "",
}: InfiniteScrollProps) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const loadingRef = useRef(false)
  const callbackRef = useRef(onLoadMore)

  // Update the callback ref when onLoadMore changes
  useEffect(() => {
    callbackRef.current = onLoadMore
  }, [onLoadMore])

  // Set up the intersection observer
  useEffect(() => {
    const currentLoaderRef = loaderRef.current
    if (!currentLoaderRef) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin: "100px" },
    )

    observer.observe(currentLoaderRef)

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef)
      }
    }
  }, [])

  // Handle loading more items when the loader becomes visible
  useEffect(() => {
    if (isVisible && hasMore && !loadingRef.current) {
      loadingRef.current = true

      // Use setTimeout to prevent immediate re-renders
      setTimeout(() => {
        if (hasMore) {
          callbackRef.current()
        }

        // Reset loading state after a delay
        setTimeout(() => {
          loadingRef.current = false
        }, 500)
      }, 100)
    }
  }, [isVisible, hasMore])

  return (
    <div ref={loaderRef} className={`py-4 text-center text-sm text-slate-500 dark:text-slate-400 ${className}`}>
      {hasMore ? loadingText : "No hay más enlaces para mostrar"}
    </div>
  )
}
