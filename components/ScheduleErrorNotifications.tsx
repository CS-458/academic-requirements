import { Close, NotificationImportant, NotificationsNone } from "@mui/icons-material";
import { Badge, Box, Divider, Grid, IconButton, Popover, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";

export default function ScheduleErrorNotification(props: { errors: string[] }): JSX.Element {
  const { errors } = props;
  /* Will have tooltip and popper */
  // TODO, mui tooltips (no max width) and popover
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenNotification = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotification = (): void => {
    setAnchorEl(null);
  };

  const getPopoverPosition = (): { top: number; left: number } => {
    let yPos: number = 0;
    let xPos: number = 0;
    if (anchorEl !== null) {
      yPos = anchorEl.offsetTop;
      xPos = anchorEl.offsetLeft + anchorEl.offsetWidth + 10;
    }
    return {
      top: yPos,
      left: xPos
    };
  };

  return (
    <>
      <IconButton onClick={handleOpenNotification} color="primary" disabled={errors?.length === 0} data-testid="notificationButton"
        sx={{ width: "fit-content" }}>
        <Tooltip title={`You Have ${errors.length} Errors`} arrow placement="right">
          <Badge badgeContent={errors?.length} color="primary">
            {errors?.length === 0 ? <NotificationsNone /> : <NotificationImportant />}
          </Badge>
        </Tooltip>
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        anchorReference="anchorPosition"
        anchorPosition={getPopoverPosition()}
        open={anchorEl !== null}
        onClose={handleCloseNotification}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
      >
        <Box
          sx={{
            width: "100%"
          }}
          data-testid="notificationPopover"
        >
          <Grid container justifyContent="space-between">
            <Typography sx={{
              alignSelf: "center",
              px: ".5em",
              fontSize: "1.2em",
              fontWeight: "bold"
            }}>
              Errors & Warnings
            </Typography>
            <Grid item justifyContent="flex-end">
              <IconButton onClick={handleCloseNotification} data-testid="notificationPopoverClose">
                <Close />
              </IconButton>
            </Grid>
          </Grid>
          {errors.map((error, index) => {
            return (
              <div key={index}>
                <Divider />
                <Box
                  sx={{
                    padding: ".5em"
                  }}
                >
                  {error[0]}
                </Box>
              </div>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}
