"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

/**
 * @component Separator
 * @description A separator component to visually divide content.
 * @param {React.Ref<React.ElementRef<typeof SeparatorPrimitive.Root>>} ref - A ref to the underlying DOM element.
 * @param {React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>} props - Props for the component.
 * @param {'horizontal' | 'vertical'} [props.orientation='horizontal'] - The orientation of the separator.
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
