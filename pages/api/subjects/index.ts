/*
    @Description
      This is the API call that gets all the Subjets
      Returns something like CNIT
*/

import { NextApiRequest, NextApiResponse } from "next";
import { Course } from "../../../entities/four_year_plan";
import sql from "../../../services/sql";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  //Creates connection to the DB
  const con = await sql();

  //queries the DB for all the GenEds for a given Concentration
  const rows = await con.all(
    ` SELECT DISTINCT c.subject 
      FROM course c
      ORDER BY c.subject ASC `
  );
  let result = [];
    rows.map((row: any) => {
      result.push(row.subject);
    });
    res.status(200).json(result);
    return;
  //Returns the data queried from the DB onto the screen
  res.status(200).json(rows);
  return;
  res.status(400).json({ error: "Concentration not defined" });
}
