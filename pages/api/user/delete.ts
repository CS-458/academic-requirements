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
    res.status(405).json({ error: "Only Post requests allowed" });
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
  let name = req.query.name;
  if (typeof name !== "string") {
    res.status(400).json({ error: "Invalid name specified" });
    return;
  }
  name = decodeURIComponent(name);

  console.log("Deleting ", name);
  const result = await con.run(
    "DELETE FROM schedule WHERE userID = ? and name = ?",
    [user, name]
  );
  console.log(result);
  if (result.changes === 1) {
    // Returns a success message
    res.status(200).json({});
  } else {
    res.status(404).json({ error: "schedule not found" });
  }
}
