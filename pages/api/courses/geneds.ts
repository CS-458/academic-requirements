import { NextApiRequest, NextApiResponse } from "next";

const majorIDs: {
  [key: string]: number;
} = {
  "Computer Science": 2
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  if (typeof req.query.mname === "string") {
    const majorId = majorIDs[req.query.mname];
    if (majorId !== undefined) {
      res.status(200).json([{ majorId }]);
      return;
    }
  }
  res.status(400).json({ error: "Major not defined" });
}
