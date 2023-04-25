import { Close, Error, NotificationImportant, NotificationsNone } from "@mui/icons-material";
import { Badge, Box, Divider, Grid, IconButton, Popover, Stack, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function ScheduleErrorNotification(props: { errors: string[][] }): JSX.Element {
  const { errors } = props;
  const [displayedErrors, setDisplayedErrors] = useState<string[][]>([]);
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

  useEffect(() => {
    // remove errors with the same name
    // error name: errors[n][0]
    // error severity: errors[n][1]
    const tempErrors: string[][] = [];
    errors.forEach((error) => {
      const found = tempErrors.findIndex((tmpErr) => tmpErr[0] === error[0]);
      if (found === -1) {
        // We haven't seen this error before, add it to the list
        tempErrors.push(error);
      }
    });
    setDisplayedErrors(tempErrors);
  }, [errors]);

  return (
    <>
      <Tooltip title={`You Have ${displayedErrors.length} Errors`} arrow placement="right" data-testid="errorBellTooltip">
        <span>
          <IconButton onClick={handleOpenNotification} color="primary" disabled={displayedErrors?.length === 0} data-testid="notificationButton"
            sx={{ width: "fit-content" }}>
            <Badge badgeContent={displayedErrors?.length} color="primary">
              {displayedErrors?.length === 0 ? <NotificationsNone /> : <NotificationImportant />}
            </Badge>
          </IconButton>
        </span>
      </Tooltip>
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
          {displayedErrors.map((error, index) => {
            return (
              <div key={index}>
                <Divider />
                <Box
                  sx={{
                    padding: ".5em"
                  }}
                >
                  <Stack direction="row">
                    <Error
                      sx={{
                        mr: ".25em",
                        color: error[1] === "error" ? "error.main" : "warning.main"
                      }}
                    />
                    {error[0]}
                  </Stack>
                </Box>
              </div>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}
