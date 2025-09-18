"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

/**
 * @component ThemeProvider
 * @description A wrapper around `next-themes`'s provider to provide theme switching functionality to the application.
 * @param {ThemeProviderProps} props - Props for the component, inherited from `next-themes`.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
