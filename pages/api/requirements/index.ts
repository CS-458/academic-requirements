/*
    @Description
      This is the API call that gets all the Requirements for a given Concentration
*/

import { NextApiRequest, NextApiResponse } from "next";
import { Course } from "../../../entities/four_year_plan";
import sql from "../../../services/sql";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if(typeof req.query.conid === "string"){
    //Creates connection to the DB
    const con = await sql();

    //queries the DB for all the Requirements for a given Concentration and saves it into the rows var
    const rows = await con.all(
      ` SELECT c.idCategory, c.name, c.parentCategory, cr.creditCount, cr.courseCount, cr.courseReqs
        FROM category c
        JOIN majorCategory mc ON mc.categoryId = c.idCategory
        JOIN concentration co ON co.majorId = mc.majorId
        JOIN categoryrequirements cr ON cr.categoryId = c.idCategory
        WHERE co.idConcentration = ?
        UNION
        SELECT c.idCategory, c.name, c.parentCategory, cr.creditCount, cr.courseCount, cr.courseReqs
        FROM category c
        JOIN concentrationCategory cc ON cc.categoryId = c.idCategory
        JOIN categoryrequirements cr ON cr.categoryId = c.idCategory
        WHERE cc.concentrationId = ?`, [req.query.conid, req.query.conid]
    );
    //Returns the data queried from the DB onto the screen
    res.status(200).json(rows);
    return;
  }
  res.status(400).json({ error: "Concentration not defined" });
}
