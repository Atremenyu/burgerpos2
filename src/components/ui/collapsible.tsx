"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * @component
 * @description A container that can be expanded or collapsed to show or hide its content.
 * This is a direct export from `@radix-ui/react-collapsible`.
 */
const Collapsible = CollapsiblePrimitive.Root

/**
 * @component
 * @description The button that toggles the collapsible's open and closed states.
 * This is a direct export from `@radix-ui/react-collapsible`.
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

/**
 * @component
 * @description The content that is shown or hidden by the collapsible.
 * This is a direct export from `@radix-ui/react-collapsible`.
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
