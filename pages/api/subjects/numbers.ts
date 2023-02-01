import { NextApiRequest, NextApiResponse } from "next";

const majorIDs: {
  [key: string]: [{ number: number }];
} = {
  CS: [
    {
      number: 158
    }
  ]
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  if (typeof req.query.sub === "string") {
    const majorId = majorIDs[req.query.sub];
    if (majorId !== undefined) {
      res.status(200).json(majorId);
      return;
    }
  }
  res.status(400).json({ error: "Subject not defined" });
}
