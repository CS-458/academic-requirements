/*
    @Description
      This is the API call that pushes the schedule form the user to the Database
*/

import { NextApiRequest, NextApiResponse } from "next";
import verifyToken from "../../../services/login";
import sql from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only Get requests allowed" });
    return;
  }

  // Creates connection to the DB
  const con = await sql();

  // Headers are lowercased
  const token = req.headers["x-google-token"];
  if (typeof token !== "string") {
    res.status(401).json({ error: "Invalid user not logged in" });
    return;
  }
  const user = verifyToken(token, con);
  if (user === undefined) {
    res.status(401).json({ error: "Invalid user token" });
    return;
  }
  const name = req.query.name;

  if (typeof name === "string") {
    // Inserts Data into the Schedule page
    const rows = await con.all(
      "SELECT * FROM schedule WHERE userId = ?", [user]);
    // Returns a success message
    res.status(200).json(rows);
    return;
  }
  // Returns an error message with invalid parameters
  res
    .status(400)
    .json({ error: `Invalid parameters: ${JSON.stringify(req.query)}` });
}
