import { NextApiRequest, NextApiResponse } from "next";
import { academicDb } from "../../services/sql";
import { MajorType } from "../../entities/four_year_plan";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const con = await academicDb();
  // const rows = await con.all(
  //   "SELECT m.idMajor, m.name, c.idConcentration, c.name as conName FROM major m JOIN concentration c ON m.idMajor = c.majorId"
  // );
  const rows = await con.all("SELECT * FROM major");
  const result = [];
  let cur: MajorType = {
    id: rows[0].idMajor,
    name: rows[0].name
  };
  rows.forEach((a) => {
    if (cur.id !== a.idMajor) {
      result.push(cur);
      cur = {
        id: a.idMajor,
        name: a.name
      };
    }
    // cur.concentrations.push({
    //   id: a.idConcentration,
    //   name: a.conName
    // });
  });
  result.push(cur);
  res.status(200).json(result);
}
