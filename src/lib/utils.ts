import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to conditionally join class names together.
 * It merges Tailwind CSS classes and resolves conflicts.
 *
 * @param {...ClassValue[]} inputs - A list of class values to be combined.
 *   These can be strings, arrays, or objects with boolean values.
 * @returns {string} The merged and optimized class name string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
