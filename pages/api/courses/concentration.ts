import { NextApiRequest, NextApiResponse } from "next";
import { Course } from "../../../entities/four_year_plan";

const majorIDs: {
  [key: number]: Course[];
} = {
  0: [
    {
      credits: 4,
      name: "Course A",
      number: 100,
      semesters: "spring",
      subject: "A",
      preReq: "",
      category: "ResA",
      id: 0,
      idCategory: 0
    }
  ]
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  if (typeof req.query.conid === "string") {
    const majorId = majorIDs[Number(req.query.conid)];
    if (majorId !== undefined) {
      res.status(200).json(majorId);
      return;
    }
  }
  res.status(400).json({ error: "Concentration not defined" });
}
