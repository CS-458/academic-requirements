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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#ffffff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  // textAlign: "center",
  color: theme.palette.text.secondary
}));

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
            const data: UserSavedSchedule["scheduleData"] = JSON.parse(
              // @ts-expect-error TODO: fix this to actually have the right type
              s.scheduleData
            );
            setUserMajor({
              completed_courses: data["Completed Courses"] ?? [],
              concentration: conns?.find(
                (m) => m.idConcentration === data.Concentration
              ) ?? {
                idConcentration: -1,
                name: "",
                fourYearPlan: "null"
              },
              major: majors?.find((m) => m.id === data.Major) ?? {
                id: -1,
                name: ""
              },
              load_four_year_plan: data.usedFourYearPlan,
              schedule_name: s.name
            });
            localStorage.setItem(
              "current-schedule",
              JSON.stringify(data.schedule)
            );
            Router.push("/scheduler").then(console.log, console.error);
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
            }).then(
              () => update(updateNum + 1),
              () => console.error("TODO")
            );
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
      getSchedules(login)
        .then((schedules) => {
          console.log(schedules);
          setSchedules(schedules);
        })
        .catch((e) => console.error(e));
      console.log("Loading schedules");
    } else {
      setSchedules([]);
      if (localStorage.getItem("google-login") == null) {
        Router.replace("/").catch(console.error);
      }
    }
  }, [login, updateNum]);
  if (login === undefined) {
    return <></>;
  }

  return (
    <Stack direction="column" sx={{ p: 20, pt: 1, pb: 1 }}>
      {
        // <Stack direction="row" sx={{ p: 1 }}>
        //   <Typography variant="h3" sx={{ pl: 2 }}>
        //     Account Actions
        //   </Typography>
        //   <p>TODO</p>
        // </Stack>
      }
      <Stack direction="column">
        <Typography variant="h4" sx={{ pl: 2 }}>
          Saved Schedules
        </Typography>
        <Stack spacing={1}>
          {schedules.map((s) =>
            scheduleRow(s, login, updateNum, update, majors.data, conns.data)
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default App;
