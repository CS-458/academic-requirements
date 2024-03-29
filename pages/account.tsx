import { Stack, Paper, Box, Typography, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  ConcentrationType,
  MajorType,
  UserSavedSchedule
} from "../entities/four_year_plan";
import { getSchedules, setUserMajor, User, UserLogin } from "../services/user";
import { styled } from "@mui/material/styles";
import { Delete, Edit } from "@mui/icons-material";
import Router from "next/router";
import { concentrationListAll, majorList } from "../services/academic";
import Link from "next/link";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#ffffff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  // textAlign: "center",
  color: theme.palette.text.secondary
}));

function throwError(p?: string): never {
  throw new Error(p);
}

function scheduleRow(
  s: UserSavedSchedule,
  login: User,
  updateNum: number,
  update: (v: number) => void,
  majors: MajorType[] | undefined,
  conns: ConcentrationType[] | undefined
): JSX.Element {
  return (
    <Item>
      <Stack
        direction="row"
        sx={{ fontSize: "24px" }}
        className="Schedule-root"
      >
        <Box sx={{ flexGrow: 1, pl: 2 }}>{s.name}</Box>
        <Stack sx={{ pr: 2, alignItems: "center" }} direction="row">
          <Typography component="span" variant="subtitle1">
            {s.timestamp}
          </Typography>
        </Stack>
        <Button
          sx={{ p: 0 }}
          onClick={() => {
            try {
              const data: UserSavedSchedule["scheduleData"] = JSON.parse(
                // @ts-expect-error TODO: fix this to actually have the right type
                s.scheduleData
              );
              setUserMajor({
                completed_courses: data["Completed Courses"],
                concentration:
                  conns?.find(
                    (m) => m.idConcentration === data.Concentration
                  ) ?? throwError("Concentration not found"),
                major:
                  majors?.find((m) => m.id === data.Major) ??
                  throwError("Major not found"),
                load_four_year_plan: data.usedFourYearPlan,
                schedule_name: s.name
              });
              localStorage.setItem(
                "current-schedule",
                JSON.stringify(data.schedule)
              );
              Router.push("/scheduler").then(console.log, console.error);
            } catch {
              fetch(`/api/user/delete?name=${encodeURIComponent(s.name)}`, {
                method: "POST",
                headers: {
                  "X-Google-Token": login.cred
                }
              }).then(() => update(updateNum + 1), console.error);
            }
          }}
        >
          <Edit
            fontSize="large"
            sx={{ pr: 1 }}
            titleAccess="edit"
            data-testid="edit"
          />
        </Button>
        <Button
          sx={{ p: 0 }}
          onClick={() => {
            fetch(`/api/user/delete?name=${encodeURIComponent(s.name)}`, {
              method: "POST",
              headers: {
                "X-Google-Token": login.cred
              }
            }).then(() => update(updateNum + 1), console.error);
          }}
        >
          <Delete
            fontSize="large"
            sx={{ pr: 1 }}
            titleAccess="delete"
            data-testid="delete"
          />
        </Button>
      </Stack>
    </Item>
  );
}

function App(): JSX.Element {
  const [updateNum, update] = useState<number>(0);

  const [schedules, setSchedules] = useState<UserSavedSchedule[]>([]);
  const majors = majorList();
  const conns = concentrationListAll();
  const login = React.useContext(UserLogin);
  useEffect(() => {
    if (login !== undefined) {
      getSchedules(login).then((schedules) => {
        console.log(schedules);
        setSchedules(schedules);
      }, console.error);
      console.log("Loading schedules");
    } else {
      setSchedules([]);
      if (localStorage.getItem("google-login") == null) {
        Router.push("/").catch(console.error);
      }
    }
  }, [login, updateNum]);
  if (login === undefined) {
    return <></>;
  }

  const rows =
    schedules.length === 0 ? (
      <Typography variant="h5" sx={{ pt: 2, pl: 2, color: "gray" }}>
        No schedules saved
      </Typography>
    ) : (
      schedules.map((s) =>
        scheduleRow(s, login, updateNum, update, majors.data, conns.data)
      )
    );

  return (
    <Stack direction="column" sx={{ p: 20, pt: 1, pb: 1 }}>
      <Stack direction="column">
        <Stack direction="row" alignItems="end">
          <Typography variant="h4" sx={{ pl: 2 }} flexGrow={1}>
            Saved Schedules
          </Typography>
          <Typography variant="h5" sx={{ pl: 2 }}>
            <Button
              onClick={() => {
                Router.push("/").catch(console.error);
              }}
            >
              Create new schedule
            </Button>
          </Typography>
        </Stack>
        <Stack spacing={1}>{rows}</Stack>
      </Stack>
    </Stack>
  );
}

export default App;
