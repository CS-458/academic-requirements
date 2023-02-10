import React, { useState } from "react";
import FourYearPlanPage from "./FourYearPlanPage";

const PassThrough = (props: {
  importData?: {};
  showing: boolean;
  majorCourseList: Array<{
    credits: number;
    name: string;
    number: number;
    semesters: string;
    subject: string;
    preReq: string;
    category: string;
    id: number;
    idCategory: number;
    dragSource: string;
  }>;
  concentrationCourseList: Array<{
    credits: number;
    name: string;
    number: number;
    semesters: string;
    subject: string;
    preReq: string;
    category: string;
    id: number;
    idCategory: number;
    dragSource: string;
  }>;
  genEdCourseList: Array<{
    credits: number;
    name: string;
    number: number;
    semesters: string;
    subject: string;
    preReq: string;
    category: string;
    id: number;
    idCategory: number;
    dragSource: string;
  }>;
  completedCourses: string[];
  selectedMajor: string;
  selectedConcentration: string;
  requirements: {
    courseCount: number;
    courseReqs: string;
    creditCount: number;
    idCategory: number;
    name: string;
    parentCategory: number;
    percentage: number;
    inheritedCredits: number;
    coursesTaken: string[];
    courseCountTaken: number;
    creditCountTaken: number;
  }[];
  requirementsGen: {
    courseCount: number;
    courseReqs: string;
    creditCount: number;
    idCategory: number;
    name: string;
    parentCategory: number;
    percentage: number;
    inheritedCredits: number;
    coursesTaken: string[];
    courseCountTaken: number;
    creditCountTaken: number;
  }[];
  fourYearPlan?: {};
}): JSX.Element => {
  // Functions and variables for controlling an error popup
  const [visibility, setVisibility] = useState(false);
  const popupCloseHandler = (): void => {
    setVisibility(false);
  };
  const [error] = useState("");

  console.log(props);

  return (
    <div>
      {props.showing && (
        <div className="screen">
          <div className="four-year-plan" data-testid="scheduleContent">
            <h1>Academic Planner</h1>
          </div>
          <div className="page">
            <FourYearPlanPage
              PassedCourseList={props.majorCourseList
                .concat(props.concentrationCourseList)
                .concat(props.genEdCourseList)}
              CompletedCourses={props.completedCourses}
              selectedMajor={props.selectedMajor}
              selectedConcentration={props.selectedConcentration}
              requirements={props.requirements}
              requirementsGen={props.requirementsGen}
              fourYearPlan={props.fourYearPlan}
              importData={props.importData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PassThrough;
