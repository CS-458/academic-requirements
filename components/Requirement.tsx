import type { FC } from "react";
import React, { memo } from "react";

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
        {percentage > 0 ? `${Math.round(percentage * digits) / digits}%` : "0%"}
      </div>
    </div>
  );
});
