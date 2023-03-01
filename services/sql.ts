import { PromisedDatabase as Database } from "promised-sqlite3";

const db = {
  db: new Database(),
  opened: false
};

export default async function sql(): Promise<Database> {
  if (!db.opened) {
    db.opened = true;
    await db.db.open("./database.sqlite");
  }
  return db.db;
}
