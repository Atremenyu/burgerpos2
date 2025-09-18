import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * A custom React hook that detects if the current viewport width is considered "mobile".
 * It listens for window resize events to provide a real-time boolean value.
 *
 * @returns {boolean} `true` if the viewport width is less than the mobile breakpoint (768px), otherwise `false`.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
