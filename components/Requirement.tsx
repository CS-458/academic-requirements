import type { FC } from "react";
import React, { memo } from "react";

// defines the expected course properties
export interface RequirementProps {
  courseCount: number;
  courseReqs: string;
  creditCount: number;
  idCategory: number;
  name: string;
  parentCategory: number;
  percentage: number;
  inheritedCredits: number;
  coursesTaken: string;
  courseCountTaken: number;
  creditCountTaken: number;
}

export const Requirement: FC<RequirementProps> = memo(function Requirement({
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
