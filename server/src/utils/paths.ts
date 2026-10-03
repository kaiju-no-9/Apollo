import { join } from "node:path";

/** Repository root directory (parent of server/). */
export const REPO_ROOT = join(import.meta.dir, "../../..");

/** Working directory where remote terminal commands execute. */
export const PROJECT_DIR = join(REPO_ROOT, "project");
