import { CourseType, RequirementComponentType, MultipleCategoriesType } from "../entities/four_year_plan";
import StringProcessing from "./StringProcessing";

class RequirementProcessing {
  majorReqCheck(
    course: CourseType, // this should be updated but it made linting error go away faster
    reqList: RequirementComponentType[]
  ): { addedCourse: boolean; reqList: RequirementComponentType[] } {
    const courseString = course.subject + "-" + course.number;
    // determines whether course has fulfilled a major course and
    // shouldn't be check for a gen-ed req
    let addedCourse = false;
    const reqCheck = new StringProcessing();
    // run once or for each category the course is in
    for (let i = 0; i < reqList.length; i++) {
      const x = reqList[i];
      // Check if this is the category of the course
      if (course.idCategory === x.idCategory) {
        // Check if a course has already been used for this requirement and if it can be repeated for credit
        if (!x.coursesTaken.includes(courseString) || (x.coursesTaken.includes(courseString) && course.repeatableForCred)) {
          if (x.coursesTaken === "") {
            x.coursesTaken = courseString;
          } else {
            x.coursesTaken = x.coursesTaken + "," + courseString;
          }
          x.percentage = calculateNewPercentage(x, course, reqCheck);
          addedCourse = true;
          if (x.parentCategory !== null) {
            // let temp1 = 1000;
            // let temp2 = 1000;
            const parent = reqList.find((item: RequirementComponentType) => item.idCategory === x.parentCategory);
            if (parent !== undefined) {
              const parentIndex = reqList.indexOf(parent);
              if (parent.coursesTaken === "") {
                reqList[parentIndex].coursesTaken = courseString;
              } else {
                reqList[parentIndex].coursesTaken = parent.coursesTaken + "," + courseString;
              }
              reqList[parentIndex].percentage = calculateNewPercentage(reqList[parentIndex], course, reqCheck);
              if (reqList[parentIndex].percentage > 100) {
                reqList[parentIndex].percentage = 100;
              }
            }
          }
          if (x.percentage > 100) {
            x.percentage = 100;
          }
        }
      }
    }
    return { addedCourse, reqList };
  }

  // Checks and updates the gen-ed requirements
  checkRequirementsGen(
    course: CourseType,
    multipleCategories: MultipleCategoriesType[],
    reqGenList: RequirementComponentType[],
    PassedCourseList: CourseType[]
  ): RequirementComponentType[] {
    const courseString = course.subject + "-" + course.number;
    const categories = multipleCategories.find(
      (item: MultipleCategoriesType) => item.idString === courseString
    )?.categories;
    const reqCheck = new StringProcessing();
    // run once or for each category the course is in
    for (let n = 0; n < (categories != null ? categories.length : 1); n++) {
      const courseCategory = categories != null ? categories[n] : course.idCategory;
      for (let i = 0; i < reqGenList.length; i++) {
        const x = reqGenList[i];
        // Check if this is the category of the course
        if (courseCategory === x.idCategory) {
          // Check if a course has already been used for this requirement
          if (!x.coursesTaken.includes(courseString) || (x.coursesTaken.includes(courseString) && course.repeatableForCred)) {
            let courseReqArr: string[] = [];
            if (x.courseReqs !== null) {
              courseReqArr = x.courseReqs.split(",");
            }
            if (x.coursesTaken === "") {
              x.coursesTaken = courseString;
            } else {
              x.coursesTaken = x.coursesTaken + "," + courseString;
            }
            if (x.courseCount === null && x.courseReqs === null && x.creditCount === null) {
              x.percentage = 100;
            } else {
              x.percentage = calculateNewPercentage(x, course, reqCheck);
            }

            if (x.percentage > 100) {
              x.percentage = 100;
            }
            if (x.parentCategory !== null) {
              let temp1 = 1000;
              let temp2 = 1000;
              let temp3 = 1000;
              const parent = reqGenList.find(
                (item: RequirementComponentType) => item.idCategory === x.parentCategory
              );
              if (parent !== undefined) {
                const parentIndex = reqGenList.indexOf(parent);
                if (reqGenList[parentIndex].coursesTaken !== "") {
                  reqGenList[parentIndex].coursesTaken += "," + courseString;
                } else {
                  reqGenList[parentIndex].coursesTaken += courseString;
                }
                // update for credits
                if (parent?.creditCount != null) {
                  if (reqGenList[parentIndex].creditCountTaken === undefined) {
                    reqGenList[parentIndex].creditCountTaken = 0;
                  }
                  reqGenList[parentIndex].creditCountTaken += course.credits;
                  temp1 =
                    reqGenList[parentIndex].creditCountTaken /
                    reqGenList[parentIndex].creditCount;
                }
                // update for number of courses
                if (parent?.courseCount != null) {
                  if (reqGenList[parentIndex].courseCountTaken === undefined) {
                    reqGenList[parentIndex].courseCountTaken = 0;
                  }
                  reqGenList[parentIndex].courseCountTaken += 1;
                  temp2 =
                    reqGenList[parentIndex].courseCountTaken /
                    (reqGenList[parentIndex].courseCount ?? 1);
                }

                if (parent?.courseReqs != null) {
                  if (parent.coursesTaken === undefined) {
                    reqGenList[parentIndex].coursesTaken = courseString;
                  } else {
                    if (parent.coursesTaken !== "") {
                      reqGenList[parentIndex].coursesTaken = parent.coursesTaken + "," + courseString;
                    } else {
                      reqGenList[parentIndex].coursesTaken = courseString;
                    }
                  }
                  courseReqArr = reqGenList[parentIndex].courseReqs?.split(",") ?? [];
                  let validCourse = false;
                  courseReqArr.forEach((item: string) => {
                    const found = reqCheck.courseInListCheck(item, [courseString], undefined);
                    if (found.returnValue) {
                      validCourse = true;
                    }
                  });
                  if (validCourse) {
                    temp3 = reqGenList[parentIndex].percentage + 1 / courseReqArr.length;
                  }
                }
                // use the lesser percentage so we don't report complete if it's not
                reqGenList[parentIndex].percentage = useLowestPercentage(temp1, temp2, temp3);
                // Make necessary changes for the categories with extra requirements
                if (parent?.idCategory === 23) {
                  // RES courses
                  // One must be RES A
                  let foundRESA = false;
                  parent?.coursesTaken.split(",").forEach((y: string) => {
                    const tempArr = y.split("-");
                    // find this course where it is RES A (if it exists)
                    const courseFound = PassedCourseList.find(
                      (item: CourseType) =>
                        item.subject === tempArr[0] &&
                        item.number === tempArr[1] &&
                        item.idCategory === 30
                    );
                    if (courseFound !== undefined) {
                      // The course is RES A
                      foundRESA = true;
                    }
                  });
                  if (!foundRESA) {
                    if (reqGenList[parentIndex].percentage > 50) {
                      reqGenList[parentIndex].percentage = 50;
                    }
                  }
                } else if (parent?.idCategory === 25) {
                  // ARNS
                  // Must include one nat lab and one math/stat
                  const percents: number[] = [];
                  reqGenList.forEach((y: RequirementComponentType) => {
                    if (y.parentCategory === 25) {
                      if (y.courseReqs != null || y.courseCount != null || y.creditCount != null
                      ) {
                        percents.push(y.percentage);
                      }
                    }
                  });
                  let sum = 0;
                  percents.forEach((y) => {
                    sum = sum + (y * 1) / percents.length;
                  });
                  reqGenList[parentIndex].percentage = sum;
                } else if (parent?.idCategory === 26 || parent?.idCategory === 27) {
                  // ART/HUM or SBSCI
                  // Must come from two different subcategories
                  if (parent?.coursesTaken.length > 1) {
                    const percents: number[] = [];
                    reqGenList.forEach((y: RequirementComponentType) => {
                      if (y.parentCategory === parent.idCategory) {
                        if (y.courseReqs != null || y.courseCount != null || y.creditCount != null) {
                          percents.push(y.percentage);
                        }
                      }
                    });
                    // at least one subcategory has it's own requirements that must
                    // be satisfied as well
                    if (percents.length > 1) {
                      let sum = 0;
                      percents.forEach((y) => {
                        sum = sum + y / percents.length;
                      });
                      reqGenList[parentIndex].percentage = sum;
                    } else {
                      // no req subcategory, just fill two different ones
                      let filledCategories = 0;
                      for (let i = 0; i < reqGenList.length; i++) {
                        // check every subcategory of the parent
                        if (reqGenList[i].parentCategory === parent.idCategory) {
                          // not the parent category but has a course filling it
                          if (reqGenList[i].coursesTaken.length > 0 && reqGenList[i].idCategory !== parent.idCategory) {
                            filledCategories++;
                          }
                        }
                      }
                      // the courses are only from one category
                      if (filledCategories === 1) {
                        if (parent.percentage > 50) {
                          parent.percentage = 50;
                        }
                      } else if (percents.length === 1) {
                        // courses are from different categories one of which is required
                        reqGenList[parentIndex].percentage =
                          parent.percentage / 2 + percents[0] / 2;
                      }
                    }
                  }
                }
                if (reqGenList[parentIndex].percentage > 100) {
                  reqGenList[parentIndex].percentage = 100;
                }
              }
            }
          }
        }
      }
    }
    return reqGenList;
  }

  removeCourseFromRequirements(
    course: CourseType,
    reqGenList: RequirementComponentType[] | null | undefined,
    reqList: RequirementComponentType[] | null | undefined
  ): { major: RequirementComponentType[] | null | undefined, gen: RequirementComponentType[] | null | undefined } {
    let temp1 = 1000;
    let temp2 = 1000;
    let temp3 = 1000;
    const reqCheck = new StringProcessing();
    if (reqList !== null && reqList !== undefined) {
      for (let i = 0; i < reqList.length; i++) {
        const courseString = course.subject + "-" + course.number;
        const coursesTaken = reqList[i].coursesTaken.split(",");
        const index = coursesTaken.indexOf(courseString);
        if (index > -1) {
          coursesTaken.splice(index, 1);
          if (reqList[i].creditCount !== null) {
            reqList[i].creditCountTaken = reqList[i].creditCountTaken - course.credits;
            temp1 = reqList[i].creditCountTaken / reqList[i].creditCount;
          }
          if (reqList[i].courseCount !== null) {
            reqList[i].courseCountTaken = reqList[i].courseCountTaken - 1;
            temp2 = reqList[i].courseCountTaken / (reqList[i].courseCount ?? 1);
          }
          if (reqList[i].courseReqs !== null) {
            const total = reqList[i].courseReqs?.split(",").length;
            temp3 = coursesTaken.length / (total ?? 1);
          }
          // set the new percentage
          reqList[i].percentage = useLowestPercentage(temp1, temp2, temp3);
          if (reqList[i].percentage > 100) {
            reqList[i].percentage = 100;
          }
        }
        // recreate the coursesTaken string
        reqList[i].coursesTaken = "";
        coursesTaken.forEach((courseString) => {
          if (reqList[i].coursesTaken !== "") {
            reqList[i].coursesTaken += ("," + courseString);
          } else {
            reqList[i].coursesTaken += courseString;
          }
        });
      }
    }
    if (reqGenList !== null && reqGenList !== undefined) {
      // check if the course is filling any gen-eds
      for (let i = 0; i < reqGenList.length; i++) {
        temp1 = 1000;
        temp2 = 1000;
        temp3 = 1000;
        const courseString = course.subject + "-" + course.number;
        if (reqGenList[i].coursesTaken !== "") {
          const coursesTaken = reqGenList[i].coursesTaken.split(",");
          const index = coursesTaken.indexOf(courseString);
          if (index > -1 && index !== undefined) {
            // remove the course from the requirement
            coursesTaken.splice(index, 1);
            if (reqGenList[i].creditCount !== null) {
              reqGenList[i].creditCountTaken = reqGenList[i].creditCountTaken - course.credits;
              temp1 = reqGenList[i].creditCountTaken / reqGenList[i].creditCount;
            }
            if (reqGenList[i].courseCount !== null) {
              reqGenList[i].courseCountTaken = reqGenList[i].courseCountTaken - 1;
              temp2 = reqGenList[i].courseCountTaken / (reqGenList[i].courseCount ?? 1);
            }
            if (reqGenList[i].courseReqs !== null) {
              const total = reqGenList[i].courseReqs?.split(",").length;
              const courseReqArr = reqGenList[i].courseReqs?.split(",") ?? [];
              let validCourse = false;
              courseReqArr.forEach((item: any) => {
                const found = reqCheck.courseInListCheck(
                  item,
                  [courseString],
                  undefined
                );
                if (found.returnValue) {
                  validCourse = true;
                }
              });
              if (validCourse) {
                temp3 = reqGenList[i].percentage - (1 / (total ?? 1)) * 100;
              }
            }
            // set the new percentage
            reqGenList[i].percentage = useLowestPercentage(temp1, temp2, temp3);
            if (temp1 === 1000 && temp2 === 1000 && temp3 === 1000 && coursesTaken.length === 0) {
              reqGenList[i].percentage = 0;
            }
            const category = reqGenList.find((item) => item.idCategory === reqGenList[i].parentCategory);
            let parentIndex: number;
            if (category !== undefined) {
              parentIndex = reqGenList.indexOf(category);
            } else {
              parentIndex = -1;
            }
            if (parentIndex !== -1) {
              if (reqGenList[parentIndex].idCategory === 25) {
                // ARNS
                // Must include one nat lab and one math/stat
                const percents: number[] = [];
                reqGenList.forEach((y) => {
                  if (y.parentCategory === 25) {
                    if (y.courseReqs !== null || y.courseCount !== null || y.creditCount !== null
                    ) {
                      percents.push(y.percentage);
                    }
                  }
                });
                let sum = 0;
                percents.forEach((y) => {
                  sum = sum + y * (1 / percents.length);
                });
                reqGenList[parentIndex].percentage = sum;
              }
              if (reqGenList[parentIndex].idCategory === 26 || reqGenList[parentIndex].idCategory === 27) {
                // ART/HUM or SBSCI
                // Must come from two different subcategories
                if (reqGenList[parentIndex].coursesTaken.length > 1) {
                  const percents: number[] = [];
                  reqGenList.forEach((y) => {
                    if (y.parentCategory === reqGenList[parentIndex].idCategory) {
                      if (y.courseReqs !== null || y.courseCount !== null || y.creditCount !== null) {
                        percents.push(y.percentage);
                      }
                    }
                  });
                  // at least one subcategory has it's own requirements that must
                  // be satisfied as well
                  if (percents.length > 1) {
                    let sum = 0;
                    percents.forEach((y) => {
                      sum = sum + y / percents.length;
                    });
                    reqGenList[parentIndex].percentage = sum;
                  } else {
                    // no req subcategory, just fill two different ones
                    let filledCategories = 0;
                    reqGenList.forEach((req) => {
                      if (req.parentCategory === reqGenList[parentIndex].idCategory) {
                        if (req.percentage === 100) {
                          filledCategories++;
                        }
                      }
                    });
                    // the courses are only from one category
                    if (filledCategories === 1) {
                      if (reqGenList[parentIndex].percentage > 50) {
                        reqGenList[parentIndex].percentage = 50;
                      }
                    } else if (percents.length === 1) {
                      // courses are from different categories one of which is required
                      reqGenList[parentIndex].percentage = reqGenList[parentIndex].percentage / 2 + percents[0] / 2;
                    }
                  }
                }
              }
              if (reqGenList[parentIndex].percentage > 100) {
                reqGenList[parentIndex].percentage = 100;
              }
            }
            if (reqGenList[i].percentage > 100) {
              reqGenList[i].percentage = 100;
            }
          }
          // recreate the coursesTaken string
          reqGenList[i].coursesTaken = "";
          coursesTaken.forEach((courseString: string) => {
            if (reqGenList[i].coursesTaken !== "") {
              reqGenList[i].coursesTaken += ("," + courseString);
            } else {
              reqGenList[i].coursesTaken += courseString;
            }
          });
        }
      }
    }
    return { major: reqList, gen: reqGenList };
  }
}

// this function checks the 3 types of requirements and returns the new percentage a req is completed
function calculateNewPercentage(requirement: RequirementComponentType, course: CourseType, reqCheck: StringProcessing): number {
  let temp1 = 1000;
  let temp2 = 1000;
  let temp3 = 1000;
  // if there is a credit count requirement calculate its percentage
  if (requirement.creditCount !== null) {
    requirement.creditCountTaken = requirement.creditCountTaken + course.credits;
    temp1 = requirement.creditCountTaken / requirement.creditCount;
  }
  // if there is a course count requirement calculate its percentage
  if (requirement.courseCount !== null) {
    requirement.courseCountTaken = requirement.courseCountTaken + 1;
    temp2 = requirement.courseCountTaken / requirement.courseCount;
  }
  // if there is a list of required course calculate the percentage complete
  if (requirement.courseReqs !== null) {
    const coursesTaken = requirement.coursesTaken.split(",");
    let validCourses: number = 0;
    const courseReqArr = requirement.courseReqs.split(",");
    courseReqArr.forEach((item: string) => {
      coursesTaken.forEach((courseToCheck: string) => {
        const found = reqCheck.courseInListCheck(
          item,
          [courseToCheck],
          undefined
        );
        if (found.returnValue) {
          validCourses++;
        }
      });
    });
    if (validCourses > 0) {
      temp3 = validCourses / courseReqArr.length;
    } else {
      temp3 = 0;
    }
  }
  // assign the lowest percentage so we don't report completed if it's not
  const newPercentage = useLowestPercentage(temp1, temp2, temp3);
  return newPercentage;
}

// This function determines the percentage to use for a requirement
function useLowestPercentage(a: number, b: number, c: number = 1000): number {
  let temp;
  if (a <= b && a <= c) {
    temp = a * 100;
  } else if (b <= c && b <= a) {
    temp = b * 100;
  } else {
    temp = c * 100;
  }
  return temp;
}
export default RequirementProcessing;
