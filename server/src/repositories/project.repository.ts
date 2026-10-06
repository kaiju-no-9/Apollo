import { projects } from "../db/schema";
import { db } from "../db";
import { PROJECT_DIR } from "../utils/paths";

const DEFAULT_PROJECT_ID = "default-project";

export class ProjectRepository {
  async ensureDefault(): Promise<void> {
    await db
      .insert(projects)
      .values({
        id: DEFAULT_PROJECT_ID,
        name: "Sample Project",
        rootPath: PROJECT_DIR,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }
}

export const projectRepository = new ProjectRepository();
