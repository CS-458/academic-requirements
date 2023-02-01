import { NextApiRequest, NextApiResponse } from "next";
import { Course } from "../../../entities/four_year_plan";

const majorIDs: {
  [key: number]: Course[];
} = {
  2: [
    {
      subject: "",
      number: 0,
      name: "",
      credits: 0,
      preReq: "",
      idCategory: 0,
      category: "",
      semesters: "",
      id: 0
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
