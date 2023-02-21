/*
    @Description
      This is the API call that gets the all the courses for given a major
*/

import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (typeof req.query.majid === "string") {
    // Creates connection to the DB
    const con = await sql();

    // queries the DB for all courses given a major and saves it into the rows var
    const rows = await con.all(
      ` SELECT co.subject, co.number, co.name, co.credits, co.preReq, co.idCourse, c.name AS 'category', c.idCategory
        FROM major m
        JOIN majorcategory mc ON m.idMajor = mc.majorId
        JOIN category c ON mc.categoryId = c.idCategory
        JOIN coursecategory cc ON c.idCategory = cc.categoryId
        JOIN course co ON cc.courseId = co.idCourse
        WHERE m.idMajor = ?
        ORDER BY co.subject, co.number `, req.query.majid
    );
    // Returns the data queried from the DB onto the screen
    res.status(200).json(rows);
    return;
  }
  res.status(400).json({ error: "Major not defined" });
}
