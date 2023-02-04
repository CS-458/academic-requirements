import React, { useEffect, useState } from "react";
import ErrorPopup from "./ErrorPopup";
import Example from "./example";

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
  }>;
  completedCourses: Array<{
    Course: string[];
  }>;
  selectedMajor: string;
  selectedConcentration: string;
  requirements: Array<{
    courseCount: number;
    courseReqs: string;
    creditCount: number;
    idCategory: number;
    name: string;
    parentCategory: number;
  }>;
  requirementsGen: Array<{
    courseCount: number;
    courseReqs: string;
    creditCount: number;
    idCategory: number;
    name: string;
    parentCategory: number;
  }>;
  fourYearPlan?: {};
}): JSX.Element => {
  // Functions and variables for controlling an error popup
  const [visibility, setVisibility] = useState(false);
  const popupCloseHandler = (): void => {
    setVisibility(false);
  };
  const [error] = useState("");

  return (
    <div>
      <div className="screen">
        <div className="four-year-plan" data-testid="scheduleContent">
          <h1>Academic Planner</h1>
        </div>
        <ErrorPopup
          onClose={popupCloseHandler}
          show={visibility}
          title="Error"
          error={error}
        />
        <div className="page">
          <Example
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
    </div>
  );
};

export default PassThrough;
