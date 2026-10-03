import { extractSessionId, usePathname } from "@/hooks/usePathname";
import { HomePage } from "@/components/HomePage";
import { TerminalPage } from "@/components/TerminalPage";

export function App() {
  const pathname = usePathname();
  const sessionId = extractSessionId(pathname);

  if (sessionId) {
    return <TerminalPage sessionId={sessionId} />;
  }

  return <HomePage />;
}

export default App;
