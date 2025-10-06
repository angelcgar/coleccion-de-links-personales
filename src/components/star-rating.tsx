interface StarRatingProps {
  rating: number
  className?: string
}

export function StarRating({ rating, className = "" }: StarRatingProps) {
  // Asegurarse de que rating sea un número válido
  const safeRating = isNaN(rating) ? 0 : rating

  return (
    <span className={`text-amber-500 dark:text-amber-400 text-sm font-medium ${className}`}>
      ⭐ {safeRating.toFixed(1)}
    </span>
  )
}
