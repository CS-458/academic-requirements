import type { FC } from "react";
import React, { memo } from "react";

export const Requirement: FC<any> = memo(function Requirement({
  name,
  percentage
}) {
  return (
    <div data-testid="requirement" className="RequirementText">
      <div className="requirementName">{name}</div>
      <div className="percentage">
        {percentage > 0 ? `${Math.round(percentage * 100) / 100}%` : "0%"}
      </div>
    </div>
  );
});
