/*
    @Description
      This is the API call that gets all the Subjects
      Returns something like CNIT
*/

import { NextApiRequest, NextApiResponse } from "next";
import { academicDb } from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Creates connection to the DB
  const con = await academicDb();

  // queries the DB for all the GenEds for a given Concentration
  const rows = await con.all(
    ` SELECT DISTINCT c.subject 
      FROM course c
      ORDER BY c.subject ASC `
  );
  const result: string[] = [];
  rows.map((row: any) => {
    result.push(row.subject);
  });
  // Returns the data queried from the DB onto the screen
  res.status(200).json(result);
}
