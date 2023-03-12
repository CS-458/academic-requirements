/*
    @Description
      This is the API call that gets all the GenEds for a given Concentration
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
    ` SELECT c.idCategory, c.name, c.parentCategory, c.shortName, cr.creditCount, cr.courseCount, cr.courseReqs
      FROM category c
      JOIN categoryrequirements cr ON cr.categoryId = c.idCategory
      WHERE c.idCategory NOT IN (SELECT categoryId FROM majorCategory) AND c.idCategory NOT IN (SELECT categoryId FROM concentrationCategory) `
  );
  // Returns the data queried from the DB onto the screen
  res.status(200).json(rows);
}
