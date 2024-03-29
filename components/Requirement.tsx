import type { FC } from "react";
import React, { memo } from "react";
import { CircularProgress, Box, Typography, Tooltip } from "@mui/material";
import { RequirementComponentType } from "../entities/four_year_plan";

interface ReqProps {
  name: string;
  percentage: number;
  digits: number;
  reqs: RequirementComponentType | undefined;
}

export const Requirement: FC<ReqProps> = memo(function Requirement({
  name,
  percentage,
  digits,
  reqs
  // number of digits displayed on screen use 1000000 with number of zeros
  // being the number of digits you want displayed
}) {
  // Formats the list of required courses string to be more readable
  function prettyString(req: string): string {
    // ensures easier reading for all symbols currently in database
    let updateString = req.replace(/_/g, "-");
    updateString = updateString.replace(/,/g, ", ");
    updateString = updateString.replace(/\|/g, " or ");
    return updateString;
  }

  // create the text for the tooltip
  // shows all 3 types of reqs and the amount they are filled
  let requirementDisplayString = "";
  if (reqs !== undefined) {
    requirementDisplayString = "Requirements To Fill: \n";
    requirementDisplayString += reqs.creditCount === null ? "" : "Credits: " + reqs.creditCount + "\n";
    requirementDisplayString += reqs.courseCount === null ? "" : "Course Count: " + reqs.courseCount + "\n";
    requirementDisplayString += (reqs.courseReqs !== "" && reqs.courseReqs !== null) ? ("Required Courses: " + prettyString(reqs.courseReqs) + "\n\n") : "\n";
    requirementDisplayString += "Requirements Currently Filled: \n";
    requirementDisplayString += reqs.creditCount === null ? "" : "Credits: " + reqs.creditCountTaken + "\n";
    requirementDisplayString += reqs.courseCount === null ? "" : "Course Count: " + reqs.courseCountTaken + "\n";
    requirementDisplayString += "Courses Taken: " + (reqs.coursesTaken !== "" ? prettyString(reqs.coursesTaken) : "none") + "\n";
  };
  return (
    <div data-testid="requirement" className="RequirementText Requirement-root">
      { // show the tooltip only if there is something to show (all but 120 credit req)
      requirementDisplayString !== ""
        ? <Tooltip title={<div style={{ whiteSpace: "pre-line" }} data-testid="requirementsTooltip">{requirementDisplayString}</div>} placement={"left"} arrow>
          <div className="requirementName" data-testid={`requirementName-${name}`}>{name}</div>
        </Tooltip>
        : <div className="requirementName">{name}</div>
      }
      <div className="percentage">
        <Box sx={{ position: "relative", display: "inline-flex", p: 0 }}>
          <CircularProgress
            variant="determinate"
            value={percentage > 100 ? 100 : percentage}
            sx={{ p: 0 }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              pt: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.primary"
              data-testid="reqPercent"
            >
              {percentage.toFixed(digits)}
            </Typography>
          </Box>
        </Box>
      </div>
    </div>
  );
});
