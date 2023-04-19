import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { screen } from "@testing-library/react";
import { setupUser, render, parentEl } from "../util";
import DropAccordian from "../../components/DropAccordian";
import { season, SemesterType } from "../../entities/four_year_plan";
import { ItemTypes } from "../../entities/Constants";
import { Course } from "../../components/DraggableCourse";
import { dragOver } from "../dragDrop";

const semesters: SemesterType[] = Object.values(season).map((season) => ({
  year: 1,
  accepts: [ItemTypes.COURSE],
  courses: [],
  season,
  SemesterCredits: 0,
  semesterNumber: 0,
  Warning: null
}));

test("Render DropAccordian", async () => {
  const user = setupUser();
  const handleDrop = jest.fn();
  const page = render(
    <DropAccordian
      year={0}
      semesters={semesters}
      handleDrop={handleDrop}
      warningDuplicateCourses={[]}
      warningFallvsSpringCourses={[]}
      warningPrerequisiteCourses={[]}
      defaultExpanded={false}
    />
  );
  expect(page.baseElement).toMatchSnapshot();
  expect(
    parentEl(screen.getByText(/Year 1/i), "MuiAccordionSummary")
  ).toHaveAttribute("aria-expanded", "false");

  await user.click(screen.getByTestId("expand-year"));
  expect(
    parentEl(screen.getByText(/Year 1/i), "MuiAccordionSummary")
  ).toHaveAttribute("aria-expanded", "true");

  await user.click(screen.getByTestId("expand-year"));
  expect(
    parentEl(screen.getByText(/Year 1/i), "MuiAccordionSummary")
  ).toHaveAttribute("aria-expanded", "false");
});

test("DropAccordian expands on hover", async () => {
  const handleDrop = jest.fn();
  render(
    <>
      <DropAccordian
        year={0}
        semesters={semesters}
        handleDrop={handleDrop}
        warningDuplicateCourses={[]}
        warningFallvsSpringCourses={[]}
        warningPrerequisiteCourses={[]}
        defaultExpanded={false}
      />
      <Course
        name="C1"
        semesters=""
        type={ItemTypes.COURSE}
        number=""
        preReq=""
        credits={1}
        subject=""
        idCourse={1}
        dragSource="CourseList"
        idCategory={1}
        warningRedColor={undefined}
        warningOrangeColor={undefined}
        warningYellowColor={undefined}
        repeatableForCred={false}
      />
    </>
  );
  expect(
    parentEl(screen.getByText(/Year 1/i), "MuiAccordionSummary")
  ).toHaveAttribute("aria-expanded", "false");

  await dragOver(
    parentEl(screen.getByText(/C1/i), "Course"),
    parentEl(screen.getByText(/Year 1/i), "MuiAccordionSummary")
  );
  expect(
    parentEl(screen.getByText(/Year 1/i), "MuiAccordionSummary")
  ).toHaveAttribute("aria-expanded", "true");
});
