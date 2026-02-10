/**
 * Safely parse a JSON string into an array.
 * Returns an empty array if parsing fails.
 */
export function parseJSON<T = string>(str: string | undefined | null): T[] {
  if (!str) return [];
  try {
    const result = JSON.parse(str);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get the first image URL from a JSON image string, or null.
 */
export function getFirstImageUrl(imagesJson: string | undefined | null): string | null {
  const images = parseJSON(imagesJson);
  return images.length > 0 ? images[0] : null;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
