import type { FC } from "react";
import React, { memo } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

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
          >{`${Math.round(percentage * digits) / digits}%`}</Typography>
        </Box>
      </Box>
      </div>
    </div>
  );
});
