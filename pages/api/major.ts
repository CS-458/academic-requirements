import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../services/sql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const con = await sql();
  const rows = await con.all("SELECT * FROM Majors");
  res.status(200).json(rows);
  // res.status(200).json([
  //   {
  //     idMajor: 2,
  //     name: "Computer Science"
  //   },
  //   {
  //     idMajor: 4,
  //     name: "Applied Math and Computer Science"
  //   },
  //   {
  //     idMajor: 5,
  //     name: "Psychology"
  //   }
  // ]);
}
