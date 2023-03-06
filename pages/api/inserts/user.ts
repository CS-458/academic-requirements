/*
    @Description
      This is the API call that pushes the User to the user table
*/

import { NextApiRequest, NextApiResponse } from "next";
import verifyToken from "../../../services/login";
import { userDb } from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  // Creates connection to the DB
  const con = await userDb();

  // Headers are lowercased
  const token = req.headers["x-google-token"];
  if (typeof token !== "string") {
    res.status(401).json({ error: "Invalid user not logged in" });
    return;
  }

  // verifyToken handles adding a user if it doesn't already exist
  const user = await verifyToken(token, con);
  if (user === undefined) {
    res.status(401).json({ error: "Invalid user token" });
    return;
  }
  // Returns an error message with invalid parameters
  res.status(200).json({ message: "Successfully registered user" });
}
