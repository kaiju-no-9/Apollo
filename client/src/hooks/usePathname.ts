import { useEffect, useState } from "react";

export function usePathname(): string {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return pathname;
}

export function extractSessionId(pathname: string): string | null {
  const match = pathname.match(/^\/session\/([^/]+)$/);
  return match?.[1] ?? null;
}
