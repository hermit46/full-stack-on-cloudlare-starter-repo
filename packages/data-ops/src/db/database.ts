import { drizzle } from "drizzle-orm/d1";

let db: ReturnType<typeof drizzle>;

export function initDatabase(bindingDb: D1Database) {
  // Takes in a D1 Database and sets it globally;
  // when app starts, we initialize the db & use it throughout the lifecycle of the request
  // Abstracts away the need to get & create queries within app code
  db = drizzle(bindingDb);
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
