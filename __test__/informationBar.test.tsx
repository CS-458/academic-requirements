import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { setupUser, render } from "./util";
import InformationDrawer from "../components/InformationBar";
import { RequirementComponentType } from "../entities/four_year_plan";

const requirementsDisplayList: RequirementComponentType[] = [{
  courseCount: null,
  courseCountTaken: 0,
  courseReqs: "CNIT-133,CNIT-134,CNIT-301,CNIT-361,CNIT-382,CNIT-383,CNIT-484,CS-458,CS-480",
  coursesTaken: "",
  creditCount: 32,
  creditCountTaken: 0,
  idCategory: 19,
  name: "CS - Cyber Security and Secure Software Development",
  parentCategory: null,
  percentage: 0,
  shortName: "CS CSSSD",
  inheritedCredits: 0
}, {
  courseCount: null,
  courseCountTaken: 0,
  courseReqs: null,
  coursesTaken: "",
  creditCount: 6,
  creditCountTaken: 0,
  idCategory: 22,
  name: "Global Perspectives (GLP)",
  parentCategory: null,
  percentage: 0,
  shortName: "GLP",
  inheritedCredits: 0
}];

test("Render the Information Bar on the Schedule Page", async () => {
  const user = setupUser();
  const bar = render(<InformationDrawer requirementsDisplay={requirementsDisplayList} />);
  expect(bar.baseElement).toMatchSnapshot();
  expect(screen.getByText(/Major/i)).toBeInTheDocument();
  expect(screen.getByText(/CS CSSSD/i)).toBeInTheDocument();
  expect(screen.getByText(/Gen Eds/i)).toBeInTheDocument();
  expect(screen.getByText(/GLP/i)).toBeInTheDocument();
  try {
    screen.getByText(/Global Perspectives (GLP)/i);
    expect(false);
  } catch (error) {
    expect(true);
  }
  const openButton = screen.getByTestId("openDrawer");
  await user.click(openButton);
  expect(screen.getByText(/Global Perspectives (GLP)/i)).toBeInTheDocument();
});
