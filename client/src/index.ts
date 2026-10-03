import { serve } from "bun";
import index from "./index.html";

const PORT = Number(process.env.PORT) || 5173;

const _server = serve({
  port: PORT,
  hostname: "0.0.0.0",
  routes: {
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Frontend listening on http://localhost:${PORT}`);
