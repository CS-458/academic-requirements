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
      // initialize the variables if they aren't already
      if (x.coursesTaken === undefined) {
        x.coursesTaken = "";
      }
      if (x.creditCountTaken === undefined) {
        x.creditCountTaken = 0;
      }
      if (x.courseCountTaken === undefined) {
        x.courseCountTaken = 0;
      }
      if (x.percentage === undefined) {
        x.percentage = 0;
      }
      // Check if this is the category of the course
      if (course.idCategory === x.idCategory) {
        // Check if a course has already been used for this requirement
        if (!x.coursesTaken.includes(courseString)) {
          let courseReqArr = x.courseReqs.split(",");
          // The only requirement is a course count
          if (x.courseCount !== null && x.courseReqs === null && x.creditCount === null) {
            x.courseCountTaken = x.courseCountTaken + 1;
            x.percentage = (x.courseCountTaken / x.courseCount) * 100;
          }
          // The only requirement is a courses required list
          if (x.courseCount === null && x.courseReqs !== null && x.creditCount === null) {
            let validCourse = false;
            courseReqArr.forEach((item: string) => {
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
              x.percentage = x.percentage + (1 / courseReqArr.length) * 100;
            }
          }
          // The only requirement is a credit count
          if (x.courseCount === null && x.courseReqs === null && x.creditCount !== null) {
            x.creditCountTaken = x.creditCountTaken + course.credits;
            x.percentage = (x.creditCountTaken / x.creditCount) * 100;
          }
          // The requirement is a course count and a list of required courses
          if (x.courseCount !== null && x.courseReqs !== null && x.creditCount === null) {
            let validCourse = false;
            courseReqArr.forEach((item: string) => {
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
              x.percentage = x.percentage + (1 / courseReqArr.length) * 100;
            }
          }
          // The requirement is a credit count and list of required courses
          if (x.courseCount === null && x.courseReqs != null && x.creditCount !== null) {
            let temp1 = 1000;
            x.creditCountTaken = x.creditCountTaken + course.credits;
            const temp2 = (x.creditCountTaken / x.creditCount) * 100;
            let validCourse = false;
            courseReqArr.forEach((item: string) => {
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
              temp1 = x.percentage + (1 / courseReqArr.length) * 100;
            }
            if (temp1 < temp2) {
              x.percentage = temp1;
            } else {
              x.percentage = temp2;
            }
          }
          // The requirement is a credit count and a course count
          if (x.courseCount !== null && x.courseReqs === null && x.creditCount !== null) {
            x.courseCountTaken = x.courseCountTaken + 1;
            x.creditCountTaken = x.creditCountTaken + course.credits;
            const temp1 = (x.creditCountTaken / x.creditCount) * 100;
            const temp2 = (x.courseCountTaken / x.courseCount) * 100;
            if (temp1 > temp2) {
              x.percentage = temp2;
            } else {
              x.percentage = temp1;
            }
          }
          // The requirement is a credit count, a course count, and a course list
          if (x.courseCount !== null && x.courseReqs !== null && x.creditCount !== null) {
            // update taken credits and course count
            x.creditCountTaken = x.creditCountTaken + course.credits;
            x.courseCountTaken = x.courseCountTaken + 1;
            let validCourse = false;
            let temp1 = x.percentage;
            courseReqArr.forEach((item: string) => {
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
              temp1 = x.percentage + (1 / courseReqArr.length) * 100;
            }
            const temp2 = (x.creditCountTaken / x.creditCount) * 100;
            const temp3 = (x.courseCountTaken / x.courseCount) * 100;
            if (temp1 <= temp2 && temp1 <= temp3) {
              x.percentage = temp1;
            } else if (temp2 <= temp1 && temp2 <= temp3) {
              x.percentage = temp2;
            } else {
              x.percentage = temp3;
            }
          }
          x.coursesTaken = x.coursesTaken + "," + courseString;
          addedCourse = true;
          if (x.parentCategory !== null) {
            let temp1 = 1000;
            let temp2 = 1000;
            const parent = reqList.find(
              (item: RequirementComponentType) => item.idCategory === x.parentCategory
            );
            const parentIndex = reqList.indexOf(parent);
            // update for credits
            if (parent?.creditCount != null) {
              if (parent.creditCountTaken === undefined) {
                reqList[parentIndex].creditCountTaken = 0;
              }
              reqList[parentIndex].creditCountTaken += course.credits;
              temp1 =
                reqList[parentIndex].creditCountTaken /
                reqList[parentIndex].creditCount;
            }
            // update for number of courses
            if (parent?.courseCount != null) {
              if (parent.courseCountTaken === undefined) {
                reqList[parentIndex].courseCountTaken = 0;
              }
              reqList[parentIndex].courseCountTaken += 1;
              temp2 =
                reqList[parentIndex].courseCountTaken /
                reqList[parentIndex].courseCount;
            }
            if (parent?.courseReqs != null) {
              if (parent.coursesTaken === undefined) {
                reqList[parentIndex].coursesTaken = "";
              }
              reqList[parentIndex].coursesTaken = parent.coursesTaken + "," + courseString;
              courseReqArr = reqList[parentIndex].coursesTaken.split(",");
              let validCourse = false;
              courseReqArr.forEach((item: string) => {
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
                reqList[parentIndex].percentage =
                  reqList[parentIndex].percentage +
                  (1 / courseReqArr.length) * 100;
              }
            } else {
              // use the lesser percentage so we don't report complete if it's not
              if (temp1 >= temp2) {
                reqList[parentIndex].percentage = temp2 * 100;
              } else {
                reqList[parentIndex].percentage = temp1 * 100;
              }
            }
            if (reqList[parentIndex].percentage > 100) {
              reqList[parentIndex].percentage = 100;
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
  ): { reqGenList: RequirementComponentType[] } {
    console.log("multiple", multipleCategories);
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
        // initialize the variables if they aren't already
        if (x.coursesTaken === undefined) {
          x.coursesTaken = "";
        }
        if (x.creditCountTaken === undefined) {
          x.creditCountTaken = 0;
        }
        if (x.courseCountTaken === undefined) {
          x.courseCountTaken = 0;
        }
        if (x.percentage === undefined) {
          x.percentage = 0;
        }
        // Check if this is the category of the course
        if (courseCategory === x.idCategory) {
          // Check if a course has already been used for this requirement
          if (!x.coursesTaken.includes(courseString)) {
            let courseReqArr: string[] = [];
            if (x.courseReqs !== null) {
              courseReqArr = x.courseReqs.split(",");
            }
            // The only requirement is a course count
            if (x.courseCount !== null && x.courseReqs === null && x.creditCount === null) {
              x.courseCountTaken = x.courseCountTaken + 1;
              x.percentage = (x.courseCountTaken / x.courseCount) * 100;
            }
            // The only requirement is a courses required list

            if (x.courseCount === null && x.courseReqs !== null && x.creditCount === null) {
              let validCourse = false;
              courseReqArr.forEach((item: string) => {
                const found = reqCheck.courseInListCheck(item, [courseString], undefined);
                if (found.returnValue) {
                  validCourse = true;
                }
              });
              if (validCourse) {
                x.percentage = x.percentage + (1 / courseReqArr.length) * 100;
              }
            }
            // The only requirement is a credit count
            if (x.courseCount === null && x.courseReqs === null && x.creditCount !== null) {
              x.creditCountTaken = x.creditCountTaken + course.credits;
              x.percentage = (x.creditCountTaken / x.creditCount) * 100;
            }
            // The requirement is a course count and a list of required courses
            if (x.courseCount !== null && x.courseReqs !== null && x.creditCount === null) {
              let validCourse = false;
              let temp1 = x.percentage;
              let temp2 = 0;
              courseReqArr.forEach((item: string) => {
                const found = reqCheck.courseInListCheck(item, [courseString], undefined);
                if (found.returnValue) {
                  validCourse = true;
                }
              });
              if (validCourse) {
                // use course reqs as percent
                temp1 = x.percentage + (1 / courseReqArr.length) * 100;
              }
              // add credits
              x.courseCountTaken = x.courseCountTaken + 1;
              temp2 = (x.courseCountTaken / x.courseCount) * 100;
              if (temp1 > temp2) {
                x.percentage = temp2;
              } else {
                x.percentage = temp1;
              }
            }
            // The requirement is a credit count and list of required courses
            if (x.courseCount === null && x.courseReqs !== null && x.creditCount !== null) {
              let validCourse = false;
              let temp1 = 0;
              let temp2 = 0;
              courseReqArr.forEach((item: string) => {
                const found = reqCheck.courseInListCheck(item, [courseString], undefined);
                if (found.returnValue) {
                  validCourse = true;
                }
              });
              if (validCourse) {
                // use req courses as percentage
                temp1 = x.percentage + (1 / courseReqArr.length) * 100;
              }
              // add to course count but don't count it yet
              x.creditCountTaken = x.creditCountTaken + course.credits;
              temp2 = (x.creditCountTaken / x.creditCount) * 100;
              // set to lowest so we don't report complete if its not
              if (temp1 > temp2) {
                x.percentage = temp2;
              } else {
                x.percentage = temp1;
              }
            }
            // The requirement is a credit count and a course count
            if (x.courseCount !== null && x.courseReqs === null && x.creditCount !== null) {
              x.courseCountTaken = x.courseCountTaken + 1;
              x.creditCountTaken = x.creditCountTaken + course.credits;
              const temp1 = (x.creditCountTaken / x.creditCount) * 100;
              const temp2 = (x.courseCountTaken / x.courseCount) * 100;
              if (temp1 > temp2) {
                x.percentage = temp2;
              } else {
                x.percentage = temp1;
              }
            }
            // The requirement is a credit count, a course count, and a course list
            if (x.courseCount !== null && x.courseReqs !== null && x.creditCount !== null) {
              // update taken credits and course count
              x.creditCountTaken = x.creditCountTaken + course.credits;
              x.courseCountTaken = x.courseCountTaken + 1;
              let validCourse = false;
              let temp1 = x.percentage;
              courseReqArr.forEach((item: string) => {
                const found = reqCheck.courseInListCheck(item, [courseString], undefined);
                if (found.returnValue) {
                  validCourse = true;
                }
              });
              if (validCourse) {
                temp1 = x.percentage + (1 / courseReqArr.length) * 100;
              }
              const temp2 = (x.creditCountTaken / x.creditCount) * 100;
              const temp3 = (x.courseCountTaken / x.courseCount) * 100;
              if (temp1 <= temp2 && temp1 <= temp3) {
                x.percentage = temp1;
              } else if (temp2 <= temp1 && temp2 <= temp3) {
                x.percentage = temp2;
              } else {
                x.percentage = temp3;
              }
            }
            if (x.courseCount === null && x.courseReqs === null && x.creditCount === null) {
              x.percentage = 100;
            }
            x.coursesTaken = x.coursesTaken + "," + courseString;
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
              const parentIndex = reqGenList.indexOf(parent);
              reqGenList[parentIndex].coursesTaken += "," + courseString;
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
                  reqGenList[parentIndex].courseCount;
              }
              if (parent?.courseReqs != null) {
                if (parent.coursesTaken === undefined) {
                  reqGenList[parentIndex].coursesTaken = "";
                }
                reqGenList[parentIndex].coursesTaken = parent.coursesTaken + "," + courseString;
                courseReqArr = reqGenList[parentIndex].courseReqs.split(",");
                let validCourse = false;
                courseReqArr.forEach((item: string) => {
                  const found = reqCheck.courseInListCheck(item, [courseString], undefined);
                  if (found.returnValue) {
                    validCourse = true;
                  }
                });
                if (validCourse) {
                  temp3 =
                    reqGenList[parentIndex].percentage +
                    1 / courseReqArr.length;
                }
              }
              // use the lesser percentage so we don't report complete if it's not
              if (temp1 <= temp2 && temp1 <= temp3) {
                reqGenList[parentIndex].percentage = temp1 * 100;
              } else if (temp2 <= temp3 && temp2 <= temp1) {
                reqGenList[parentIndex].percentage = temp2 * 100;
              } else {
                reqGenList[parentIndex].percentage = temp3 * 100;
              }

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
                    if (
                      y.courseReqs != null ||
                      y.courseCount != null ||
                      y.creditCount != null
                    ) {
                      percents.push(y.percentage);
                    }
                  }
                });
                let sum = 0;
                percents.forEach((y) => {
                  if (y === undefined) {
                    y = 0;
                  }
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
                      if (
                        y.courseReqs != null ||
                        y.courseCount != null ||
                        y.creditCount != null
                      ) {
                        percents.push(y.percentage);
                      }
                    }
                  });
                  // at least one subcategory has it's own requirments that must
                  // be satisfied as well
                  if (percents.length > 1) {
                    let sum = 0;
                    percents.forEach((y) => {
                      if (y === undefined) {
                        y = 0;
                      }
                      sum = sum + y / percents.length;
                    });
                    reqGenList[parentIndex].percentage = sum;
                  } else {
                    // no req subcat, just fill two different ones
                    let filledCategories = 0;
                    for (let i = 0; i < reqGenList.length; i++) {
                      if (reqGenList[i].parentCategory === parent.idCategory) {
                        if (
                          reqGenList[i].coursesTaken.length > 0 &&
                          reqGenList[i].idCategory !== parent.idCategory
                        ) {
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
    console.log("list", reqGenList);
    return reqGenList;
  }
}

export default RequirementProcessing;
