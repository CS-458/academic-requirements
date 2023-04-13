import type { FC } from "react";
import React, { memo } from "react";
import { CircularProgress, Box, Typography, Tooltip } from "@mui/material";

export const Requirement: FC<any> = memo(function Requirement({
  name,
  percentage,
  digits,
  reqs
  // number of digits displayed on screen use 1000000 with number of zeros
  // being the number of digits you want displayed
}) {
  console.log(reqs);
  let requirementDisplayString = "";
  if (reqs !== undefined) {
    requirementDisplayString = "Requirements To Fill: \n";
    requirementDisplayString += "Credits: " + (reqs.creditCount ?? 0) + "\n";
    requirementDisplayString += "Course Count: " + (reqs.courseCount ?? 0) + "\n";
    requirementDisplayString += "Required Courses: " + (reqs.courseReqs ?? "none") + "\n\n";
    requirementDisplayString += "Requirements Currently Filled: \n";
    requirementDisplayString += "Credits: " + (reqs.creditCountTaken ?? 0) + "\n";
    requirementDisplayString += "Course Count: " + (reqs.courseCountTaken ?? 0) + "\n";
    requirementDisplayString += "Required Courses: " + (reqs.coursesTaken ?? "none") + "\n";
  };
  return (
    <div data-testid="requirement" className="RequirementText">
      {requirementDisplayString !== ""
        ? <Tooltip title={<div style={{ whiteSpace: "pre-line" }}>{requirementDisplayString}</div>} placement={"left"} arrow>
          <div className="requirementName">{name}</div>
        </Tooltip>
        : <div className="requirementName">{name}</div>
      }
      <div className="percentage">
        <Box sx={{ position: "relative", display: "inline-flex", p: 0 }}>
        <CircularProgress variant="determinate" value={percentage} sx={{ p: 0 }}/>
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
          >{`${Math.round(percentage * digits) / digits}`}</Typography>
        </Box>
      </Box>
      </div>
    </div>
  );
});
