import { OAuth2Client } from "google-auth-library";
import secrets from "../secrets.json";

const client = new OAuth2Client(secrets.client.id);

export default async function verifyToken(
  token: string
): Promise<string | undefined> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: secrets.client.id
    });
    return ticket.getPayload()?.sub;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
