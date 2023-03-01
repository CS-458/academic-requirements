/*
    @Description
      This is the API call that pushes the schedule form the user to the Database
*/

import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: `Only POST requests allowed` });
    return;
  }
  let user = undefined;
  // Headers are lowercased
  if (req.headers["x-google-token"] === "TEST_TOKEN") {
    user = 1234;
  } else {
    res.status(401).json({ error: `Invalid user token` });
    return;
  }
  const name = req.query.name;
  if (typeof name === "string" && req.body != null) {
    // Creates connection to the DB
    const con = await sql();

    // Inserts Data into the Schedule page
    await con.all(
      `INSERT INTO schedule (userID, name, sceduleData) 
        VALUES (?, ?, ?) 
        ON CONFLICT(userId, name) DO UPDATE SET sceduleData = excluded.sceduleData`,
      [user, name, JSON.stringify(req.body)]
    );
    // Returns a success message
    res.status(200).json({ message: "Successfully uploaded schedule" });
    return;
  }
  // Returns an error message with invalid parameters
  res
    .status(400)
    .json({ error: `Invalid parameters: ${JSON.stringify(req.query)}` });
}
