import type { FC } from "react";
import React, { memo } from "react";
// import CircularProgressWithLabel from "@mui/material/CircularProgress";
export const Requirement: FC<any> = memo(function Requirement({
  name,
  percentage,
  digits
  // number of digits displayed on screen use 1000000 with number of zeros
  // being the number of digits you want displayed
}) {
  return (
    <div data-testid="requirement" className="RequirementText">
      <div className="requirementName">{name}</div>
      <div className="percentage">
      {/* <CircularProgressWithLabel value={Math.round(percentage * digits) / digits} /> */}
      {`${Math.round(percentage * digits) / digits}%`}
      </div>
    </div>
  );
});
