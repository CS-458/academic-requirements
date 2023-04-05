import { NextApiRequest, NextApiResponse } from "next";
import { ConcentrationType } from "../../entities/four_year_plan";
import { academicDb } from "../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const con = await academicDb();
  const rows = await con.all("SELECT * FROM concentration");
  const result = [];
  let cur: ConcentrationType = {
    idConcentration: rows[0].idConcentration,
    name: rows[0].name,
    fourYearPlan: rows[0].fourYearPlan
  };
  rows.forEach((a) => {
    if (cur.idConcentration !== a.idConcentration) {
      result.push(cur);
      cur = {
        idConcentration: a.idConcentration,
        name: a.name,
        fourYearPlan: a.fourYearPlan
      };
    }
  });
  result.push(cur);
  res.status(200).json(result);
}
