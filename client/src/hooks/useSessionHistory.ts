import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { getBackendBaseUrl } from "@/lib/api";
import type { SessionMessage } from "@/types/websocket";

export function useSessionHistory(sessionId: string): {
  history: SessionMessage[];
  isLoading: boolean;
} {
  const [history, setHistory] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory(): Promise<void> {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${getBackendBaseUrl()}/api/sessions/${encodeURIComponent(sessionId)}/messages`,
        );

        if (response.status === 501 || !response.ok) {
          if (!isCancelled) {
            setHistory([]);
          }
          return;
        }

        const data = (await response.json()) as SessionMessage[];

        if (!isCancelled) {
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!isCancelled) {
          setHistory([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [sessionId]);

  return { history, isLoading };
}

export function useTerminalScroll<T extends HTMLElement>(
  dependency: string,
): {
  containerRef: RefObject<T | null>;
  scrollToBottom: () => void;
} {
  const containerRef = useRef<T | null>(null);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [dependency, scrollToBottom]);

  return { containerRef, scrollToBottom };
}
