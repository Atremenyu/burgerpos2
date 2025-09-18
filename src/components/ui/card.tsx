import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @component
 * @description A container that groups related content and actions.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card Content</p>
 *   </CardContent>
 *   <CardFooter>
 *     <p>Card Footer</p>
 *   </CardFooter>
 * </Card>
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * @component
 * @description The header of the card, typically containing the title and description.
 * @param {React.Ref<HTMLDivElement>} ref - A ref to the underlying DOM element.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props for the component.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * @component
 * @description The title of the card. Should be used within a `CardHeader`.
 * @param {React.Ref<HTMLHeadingElement>} ref - A ref to the underlying DOM element.
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - Props for the component.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle"


/**
 * @component
 * @description The description of the card. Should be used within a `CardHeader`.
 * @param {React.Ref<HTMLParagraphElement>} ref - A ref to the underlying DOM element.
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Props for the component.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * @component
 * @description The main content of the card.
 * @param {React.Ref<HTMLDivElement>} ref - A ref to the underlying DOM element.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props for the component.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * @component
 * @description The footer of the card, typically containing action buttons.
 * @param {React.Ref<HTMLDivElement>} ref - A ref to the underlying DOM element.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props for the component.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
