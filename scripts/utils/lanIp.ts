import { networkInterfaces } from "node:os";

/**
 * Returns the first non-internal IPv4 address on the local network.
 * Used by setup and remote CLI commands to print LAN-accessible URLs.
 */
export function getLanIp(): string | null {
  const interfaces = networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;

    for (const config of iface) {
      const family = config.family;
      const isIpv4 =
        family === "IPv4" || (typeof family === "number" && family === 4);

      if (isIpv4 && !config.internal) {
        return config.address;
      }
    }
  }

  return null;
}
