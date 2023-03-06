import { OAuth2Client } from "google-auth-library";
import { PromisedDatabase } from "promised-sqlite3";
import secrets from "../secrets.json";

const client = new OAuth2Client(secrets.client.id);

export function updateClient(update: (c: OAuth2Client) => void): void {
  update(client);
}

export default async function verifyToken(
  token: string,
  con?: PromisedDatabase
): Promise<string | undefined> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: secrets.client.id
    });
    const id = ticket.getPayload()?.sub;
    if (id !== undefined && con !== undefined) {
      await con.all(
        `INSERT INTO user (idUser, role)
         VALUES (?, ?)
         ON CONFLICT(idUser) DO NOTHING`,
        [id, "user"]
      );
    }
    return id;
  } catch (e) {
    // console.error(e);
    return undefined;
  }
}
