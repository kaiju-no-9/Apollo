export function getBackendBaseUrl(): string {
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  return `${protocol}://${window.location.hostname}:3000`;
}

export function getWebSocketUrl(sessionId: string): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.hostname}:3000/ws?sessionId=${encodeURIComponent(sessionId)}`;
}
