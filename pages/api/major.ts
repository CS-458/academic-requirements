import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const con = await sql();
  // const rows = await con.all(
  //   "SELECT m.idMajor, m.name, c.idConcentration, c.name as conName FROM major m JOIN concentration c ON m.idMajor = c.majorId"
  // );
  const rows = await con.all(
    "SELECT * FROM major"
  );
  const result = [];
  let cur: {
    id?: number;
    name?: string;
    // concentrations: Array<{ id: number; name: string }>;
  } = {
    id: rows[0].idMajor,
    name: rows[0].name
    // concentrations: []
  };
  rows.forEach((a) => {
    if (cur.id !== a.idMajor) {
      result.push(cur);
      cur = {
        id: a.idMajor,
        name: a.name
        // concentrations: []
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
