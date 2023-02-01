import { NextApiRequest, NextApiResponse } from "next";

const majorIDs: {
  [key: number]: Array<{
    idConcentration: number;
    name: string;
    majorId: number;
    fourYearPlan: string;
  }>;
} = {
  2: [
    {
      idConcentration: 2,
      name: "cs",
      majorId: 2,
      fourYearPlan: "null"
    }
  ]
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  if (typeof req.query.majid === "string") {
    const majorId = majorIDs[Number(req.query.majid)];
    if (majorId !== undefined) {
      res.status(200).json(majorId);
      return;
    }
  }
  res.status(400).json({ error: "Major not defined" });
}
