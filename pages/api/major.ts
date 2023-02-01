import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  res.status(200).json([
    {
      idMajor: 2,
      name: "Computer Science"
    },
    {
      idMajor: 4,
      name: "Applied Math and Computer Science"
    },
    {
      idMajor: 5,
      name: "Psychology"
    }
  ]);
}
