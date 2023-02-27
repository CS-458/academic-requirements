/*
    @Description
      This is the API call that gets all the course numbers for given a subject
      Returns something like '133'
*/

import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (typeof req.query.sub === "string") {
    // Creates connection to the DB
    const con = await sql();

    // queries the DB for all courses given a Subject and saves it into the rows var
    const rows = await con.all(
      ` SELECT DISTINCT c.number 
        FROM course c 
        WHERE c.subject = ?
        ORDER BY c.number ASC `, req.query.sub
    );
    // Returns the data queried from the DB onto the screen
    const result: number[] = [];
    rows.map((row: any) => {
      result.push(row.number);
    });
    res.status(200).json(result);
    return;
    // var result = rows.find(obj =>{
    //   res.status(200).json(obj.number)
    //   return;
    // })
    // res.status(200).json(rows.number);
  }
  res.status(400).json({ error: "Subject not defined" });
}
