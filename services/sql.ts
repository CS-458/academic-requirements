import { PromisedDatabase as Database } from "promised-sqlite3";

const academic = {
  db: new Database(),
  opened: false
};

export async function academicDb(): Promise<Database> {
  if (!academic.opened) {
    academic.opened = true;
    await academic.db.open("./database.sqlite");
  }
  return academic.db;
}

export function setAcademicDb(db: Database): void {
  academic.db = db;
}

const user = {
  db: new Database(),
  opened: false
};

export async function userDb(): Promise<Database> {
  if (!user.opened) {
    user.opened = true;
    await user.db.open("./users.sqlite");
  }
  return user.db;
}

export function setUserDb(db: Database): void {
  user.db = db;
  user.opened = true;
}
