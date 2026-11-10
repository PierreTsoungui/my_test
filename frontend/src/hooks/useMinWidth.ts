import { useEffect, useState } from "react";

export function useMinWidth(px: number): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width: ${px}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${px}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [px]);

  return matches;
}