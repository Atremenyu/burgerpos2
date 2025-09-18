import { cn } from "@/lib/utils"

/**
 * @component Skeleton
 * @description A placeholder component to display while content is loading.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Props for the component.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
