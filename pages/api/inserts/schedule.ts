/*
    @Description
      This is the API call that pushes the schedule form the user to the Database
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
  const user = await verifyToken(token, con);
  if (user === undefined) {
    res.status(401).json({ error: "Invalid user token" });
    return;
  }
  const name = req.query.name;
  if (typeof name === "string" && req.body != null) {
    // Inserts Data into the Schedule page
    await con.run(
      `INSERT INTO schedule (userID, name, scheduleData) 
        VALUES (?, ?, ?) 
        ON CONFLICT(userID, name) DO UPDATE SET scheduleData = excluded.scheduleData, timestamp = datetime('now', 'localtime')`,
      [user, name, req.body]
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
