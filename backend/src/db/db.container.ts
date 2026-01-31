import type { IDbService } from './db.service.interface';
import { createPgDbService } from './pg.db.service';

let dbInstance: IDbService | null = null;

/**
 * Initialize the database service. Call at app startup.
 * Pass a custom implementation for testing.
 */
export function initDb(impl?: IDbService): IDbService {
  dbInstance = impl ?? createPgDbService();
  return dbInstance;
}

/**
 * Get the database service. Initializes with default PostgreSQL if not yet set.
 */
export function getDb(): IDbService {
  if (!dbInstance) {
    dbInstance = createPgDbService();
  }
  return dbInstance;
}
