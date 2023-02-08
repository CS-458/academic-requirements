/*
    @Description
      This is the API call that gets the all the GenED courses
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

    //queries the DB for all GenEDs and saves it into the rows var
    const rows = await con.all(
      ` SELECT co.subject, co.number, co.credits, co.semesters, co.name, co.preReq, co.idCourse, cat.name AS 'category', cat.idCategory
        FROM category cat
        JOIN coursecategory cc ON cc.categoryId = cat.idCategory
        JOIN course co ON co.idCourse = cc.courseId
        WHERE cat.idCategory NOT IN (SELECT categoryId FROM majorCategory) AND 
        cat.idCategory NOT IN (SELECT categoryId FROM concentrationCategory)
        ORDER BY co.subject, co.number `
    );
    //Returns the data queried from the DB onto the screen
    res.status(200).json(rows);
    return;
  }
  res.status(400).json({ error: "Major not defined" });
}
