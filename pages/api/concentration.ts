import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (typeof req.query.majid === "string") {
    const con = await sql();
    const rows = await con.all(
      "SELECT * FROM concentration WHERE majorId = ?", req.query.majid
    );
    const result = [];
    let cur: {
      id?: number;
      name?: string;
      fourYearPlan?: string;
    } = {
      id: rows[0].idConcentration,
      name: rows[0].name,
      fourYearPlan: rows[0].fourYearPlan
    };
    rows.forEach((a) => {
      if (cur.id !== a.idConcentration) {
        result.push(cur);
        cur = {
          id: a.idConcentration,
          name: a.name,
          fourYearPlan: a.fourYearPlan
        };
      }
    });
    result.push(cur);
    res.status(200).json(result);
    return;
  }
  res.status(400).json({ error: "Major not defined" });
}
