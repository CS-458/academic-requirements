/*
    @Description
      This is the API call that gets the all the courses for given a concentration
*/

import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (typeof req.query.conid === "string") {
    // Creates connection to the DB
    const con = await sql();

    // queries the DB for all Concentrations and saves it into the rows var
    const rows = await con.all(
      ` SELECT co.subject, co.number, co.credits, co.semesters, co.name, co.preReq, co.idCourse, ca.name AS 'category', ca.idCategory
        FROM concentration c
        JOIN concentrationcategory cc ON c.idConcentration = cc.concentrationId
        JOIN category ca ON cc.categoryId = ca.idCategory
        JOIN coursecategory coc ON ca.idCategory = coc.categoryId
        JOIN course co ON coc.courseId = co.idCourse
        WHERE c.idConcentration = ?
        ORDER BY co.subject, co.number `, req.query.conid
    );
    // Returns the data queried from the DB onto the screen
    res.status(200).json(rows);
    return;
  }
  res.status(400).json({ error: "Concentration not defined" });
}
