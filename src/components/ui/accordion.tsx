"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * @component
 * @description A vertically stacked set of interactive headings that each reveal a section of content.
 * This component is built on top of the Radix UI Accordion primitive.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Is it accessible?</AccordionTrigger>
 *     <AccordionContent>
 *       Yes. It adheres to the WAI-ARIA design pattern.
 *     </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */

const Accordion = AccordionPrimitive.Root

/**
 * @component
 * @description A single item within the accordion, containing a trigger and content.
 * It wraps the Radix UI Accordion Item primitive.
 *
 * @param {React.ElementRef<typeof AccordionPrimitive.Item>} ref - A ref to the underlying DOM element.
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>} props - Props for the component.
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * @component
 * @description The trigger button that toggles the visibility of an accordion item's content.
 * It wraps the Radix UI Accordion Trigger primitive.
 *
 * @param {React.ElementRef<typeof AccordionPrimitive.Trigger>} ref - A ref to the underlying DOM element.
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>} props - Props for the component.
 * @param {React.ReactNode} props.children - The content of the trigger.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * @component
 * @description The content panel that is revealed when an accordion item is opened.
 * It wraps the Radix UI Accordion Content primitive.
 *
 * @param {React.ElementRef<typeof AccordionPrimitive.Content>} ref - A ref to the underlying DOM element.
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>} props - Props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed.
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
