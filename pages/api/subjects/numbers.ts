/*
    @Description
      This is the API call that gets the all the course numbers for given a suject
      Returns something like '133'
*/

import { NextApiRequest, NextApiResponse } from "next";
import { Course } from "../../../entities/four_year_plan";
import sql from "../../../services/sql";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if(typeof req.query.sub === "string"){
    //Creates connection to the DB
    const con = await sql();

    //queries the DB for all courses given a Subject and saves it into the rows var
    const rows = await con.all(
      ` SELECT DISTINCT c.number 
        FROM course c 
        WHERE c.subject = ?
        ORDER BY c.number ASC `, req.query.sub
    );
    //Returns the data queried from the DB onto the screen
    res.status(200).json(rows);
    return;
  }
  res.status(400).json({ error: "Major not defined" });
}
