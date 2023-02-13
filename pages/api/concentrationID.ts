import { NextApiRequest, NextApiResponse } from "next";

const concentrationIDs: {
  [key: string]: number;
} = {
  cs: 2
};

// TODO: use major id to narrow
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  if (typeof req.query.cname === "string") {
    const majorId = concentrationIDs[req.query.cname];
    if (majorId !== undefined) {
      res.status(200).json([{ majorId }]);
      return;
    }
  }
  res.status(400).json({ error: "Major not defined" });
}
