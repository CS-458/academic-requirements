import React from "react";
import FourYearPlanPage from "./FourYearPlanPage";
import { masterCourseList, courseCategoryRequirements, genedCategoryRequirements } from "../services/academic";
import { userMajor } from "../services/user";
import { CourseType, RequirementComponentType } from "../entities/four_year_plan";

const PassThrough = (props: {
  // importData?: {};
  showing: boolean;
}): JSX.Element => {
  // Functions and variables for controlling an error popup

  // major and minor come from user service
  const courseList: CourseType[] = masterCourseList(userMajor()?.major.id, userMajor()?.concentration.idConcentration);

  const requirements: RequirementComponentType[] | null | undefined = courseCategoryRequirements(userMajor()?.concentration.idConcentration).data;
  const requirementsGen: RequirementComponentType[] | null | undefined = genedCategoryRequirements().data;

  return (
    <div>
      {props.showing && (
        <div className="screen">
          <br/>
          <div className="page">
            <FourYearPlanPage
              PassedCourseList={courseList}
              requirements={requirements}
              requirementsGen={requirementsGen}
              importData={undefined}// props.importData
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PassThrough;
