import { RequirementComponentType, CourseType } from "./four_year_plan";

// Moves child requirements into parent categories where appropriate
export function processRequirementLists(
  requirements: RequirementComponentType[],
  requirementsGen: RequirementComponentType[]):
  { req: RequirementComponentType[], reqGen: RequirementComponentType[], display: RequirementComponentType[] } {
  const temp: RequirementComponentType[] = [];
  let tempReqList: RequirementComponentType[] = requirements;
  const tempGen: RequirementComponentType[] = requirementsGen;
  tempReqList.forEach((x) => {
    if (x.parentCategory === null && !(x.courseReqs === null && x.creditCount === null && x.courseCount === null)) {
      temp.push(x);
    } else {
      tempReqList.forEach((n) => {
        if (n.idCategory === x.parentCategory) {
          if (n.courseReqs === null && n.creditCount === null && n.courseCount === null) {
            temp.push(x);
          }
        }
      });
    }

    if (x.parentCategory !== null) {
      // recursively moves gen ed requirements to their parent req
      function moveReqs(x: RequirementComponentType): void {
        let parent: RequirementComponentType | null = null;
        for (let i = 0; i < tempGen.length; i++) {
          // locate the parent requirement
          if (tempGen[i].idCategory === x.parentCategory) {
            // add any child reqs to the parent's reqs
            parent = tempGen[i];
            tempGen[i].inheritedCredits = x.creditCount;
            if (tempGen[i].courseReqs === null) {
              tempGen[i].courseReqs = x.courseReqs;
            } else if (tempGen[i].courseReqs?.includes(x.courseReqs ?? "") !== undefined) {
              tempGen[i].courseReqs = tempGen[i].courseReqs + "," + x.courseReqs;
            }
            tempGen[i].inheritedCredits = x.creditCount;
            tempReqList = tempReqList.filter((item) => item.idCategory !== x.idCategory);
          }
        }
        // if the parent has a parent call the function again
        if (parent?.parentCategory !== null && parent !== null) {
          moveReqs(parent);
        }
      }
      moveReqs(x);
    }
  });
  tempReqList.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  tempGen.forEach((x) => {
    if (x.parentCategory === null || x.parentCategory === undefined) {
      temp.push(x);
    }
  });
  tempGen.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });

  return { req: tempReqList, reqGen: tempGen, display: temp };
}

// Creates a list of courses that can potentially fill multiple requirements categories
export function createMultipleCategoryList(PassedCourseList: CourseType[]): { idString: string, categories: number[] } [] {
  const tempArr: {
    idString: string;
    categories: number[];
  }[] = [];
  // go through each item in the array to get any with duplicate categories
  for (let i = 0; i < PassedCourseList.length; i++) {
    let skip = false;
    // check that we haven't already added this on to the array
    for (let k = 0; k < tempArr.length; k++) {
      if (
        PassedCourseList[i].subject + "-" + PassedCourseList[i].number ===
        tempArr[k].idString
      ) {
        skip = true;
      }
    }
    // only look for more if this one isn't recorded
    if (!skip) {
      const currentIdString =
        PassedCourseList[i].subject + "-" + PassedCourseList[i].number;
      const tempCatArr: number[] = [];
      for (let j = i; j < PassedCourseList.length; j++) {
        if (
          currentIdString ===
          PassedCourseList[j].subject + "-" + PassedCourseList[j].number
        ) {
          tempCatArr.push(PassedCourseList[j].idCategory);
        }
      }
      if (tempCatArr.length > 1) {
        tempArr.push({ idString: currentIdString, categories: tempCatArr });
      }
    }
  }
  return tempArr;
}
