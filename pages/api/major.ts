import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const con = await sql();
  const rows = await con.all("SELECT * FROM major");
  res.status(200).json(rows);
}
