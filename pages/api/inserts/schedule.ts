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
  if (typeof req.query.schedule === "string" && typeof req.query.user === "number") {
    // Creates connection to the DB
    const con = await sql();

    // Inserts Data into the Schedule page
    await con.all(
      `INSERT INTO schedule (userID, sceduleData) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE sceduleData = VALUES(sceduleData)`, [req.query.user, req.query.schedule]
    );
    // Returns a success message
    res.status(200).json({ message: "Successfully uploaded schedule" });
    return;
  }
  // Returns an error message with invalid parameters
  res.status(400).json({ error: `Invalid parameters: ${JSON.stringify(req.query)}` });
}
