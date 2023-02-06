import { PromisedDatabase as Database } from "promised-sqlite3";

export default async function sql(): Promise<Database> {
  const db = new Database();
  await db.open("./database.sqlite");
  return db;
}
