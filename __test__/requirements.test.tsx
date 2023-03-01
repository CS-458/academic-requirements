import RequirementsProcessing from "../entities/requirementsProcessing";
import { RequirementComponentType, CourseType } from "../entities/four_year_plan";
import { fetchApiJson } from "./util";

// This test checks major/concentration requirements
test("Check Major/Concentration Requirements Processing", async () => {
  // Computer Science, Cyber Security
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements?conid=14"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get major courses for computer science
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/major?majid=2"
  );
  const reqCheck = new RequirementsProcessing();
  // get CS-145
  let course = courses.find((x) => x.idCourse === 294);
  let response;
  if (course !== undefined) {
    response = reqCheck.majorReqCheck(course, reqs);
  }
  // expect the course to have been added to a requirement
  expect(response?.addedCourse).toBe(true);
  // check the right category is updated
  let category = response?.reqList.find((x) => x.idCategory === 20);
  // check the right percentage is assigned
  expect(category?.percentage).toBeCloseTo(9.09, 2);

  // get CS-244
  course = courses.find((x) => x.idCourse === 295);
  if (course !== undefined) {
    response = reqCheck.majorReqCheck(course, reqs);
  }
  expect(response?.addedCourse).toBe(true);
  category = response?.reqList.find((x) => x.idCategory === 20);
  expect(category?.percentage).toBeCloseTo(18.18, 2);

  // try removing a course from the req list
  if (course !== undefined) {
    const removeResponse = reqCheck.removeCourseFromRequirements(course, null, reqs);
    expect(removeResponse?.major).not.toBe(null);
    expect(removeResponse?.gen).toBe(null);
    expect(removeResponse.major?.find((x) => x.idCategory === 20)?.percentage).toBeCloseTo(9.09, 2);
  }
});

// This test checks that repeatable for credit courses can get credit twice
test("Check repeatable for credit courses", async () => {
  // Computer Science, Cyber Security
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements?conid=14"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get major courses for computer science
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/concentration?conid=14"
  );
  const reqCheck = new RequirementsProcessing();

  // get CNIT-133
  let course = courses.find((x) => x.idCourse === 322);
  let response;
  if (course !== undefined) {
    response = reqCheck.majorReqCheck(course, reqs);
  }
  // expect the course to have been added to a requirement
  expect(response?.addedCourse).toBe(true);
  // check the right category is updated
  let category = response?.reqList.find((x) => x.idCategory === 19);
  // check the right percentage is assigned
  expect(category?.percentage).toBeCloseTo(9.38, 1);

  // Add CNIT-133 a second time, reqs shouldn't change
  if (course !== undefined) {
    response = reqCheck.majorReqCheck(course, reqs);
  }
  // expect the course to have been added to a requirement
  expect(response?.addedCourse).toBe(false);
  // check the right category is updated
  category = response?.reqList.find((x) => x.idCategory === 19);
  // check the right percentage is assigned
  expect(category?.percentage).toBeCloseTo(9.38, 1);

  // get CS-458 which is repeatable for credit
  course = courses.find((x) => x.idCourse === 320);
  if (course !== undefined) {
    response = reqCheck.majorReqCheck(course, reqs);
  }
  // expect the course to have been added to a requirement
  expect(response?.addedCourse).toBe(true);
  // check the right category is updated
  category = response?.reqList.find((x) => x.idCategory === 19);
  // check the right percentage is assigned
  expect(category?.percentage).toBeCloseTo(21.88, 1);

  // Add CS-145 a second time, reqs shouldn't change
  if (course !== undefined) {
    response = reqCheck.majorReqCheck(course, reqs);
  }
  // expect the course to have been added to a requirement
  expect(response?.addedCourse).toBe(true);
  // check the right category is updated
  category = response?.reqList.find((x) => x.idCategory === 19);
  // check the right percentage is assigned
  expect(category?.percentage).toBeCloseTo(33.33, 1);
});

// This test check general education requirements processing including courses in multiple requirements
test("Check General Requirements Processing", async () => {
  // Get general requirements
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements/gen"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get gen ed courses
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/geneds"
  );
  let multipleCats: { idString: string; categories: number[]; }[] = [];
  multipleCats = createMultipleCategories(courses, multipleCats);
  // res-A 30 //res 23 // course PAX-278 27
  const reqCheck = new RequirementsProcessing();
  // get PAX-278 (fills only res-A)
  let course = courses.find((x) => x.idCourse === 27);
  let response;
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
  }
  // expect the course to have been added to a requirement
  expect(response).not.toBe(null);
  // check the right category is updated
  let category = response?.find((x) => x.idCategory === 30);
  // check the right percentage is assigned
  expect(category?.percentage).toBeCloseTo(100, 2);
  category = response?.find((x) => x.idCategory === 23);
  expect(category?.percentage).toBeCloseTo(50, 2);

  // anth-220 40
  course = courses.find((x) => x.idCourse === 40);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
  }
  // Global Perspectives
  category = response?.find((x) => x.idCategory === 22);
  expect(category?.percentage).toBeCloseTo(50, 2);
  // SBSCI - Anthropology
  category = response?.find((x) => x.idCategory === 42);
  expect(category?.percentage).toBeCloseTo(100, 2);
  // SBSCI
  category = response?.find((x) => x.idCategory === 27);
  expect(category?.percentage).toBeCloseTo(50, 2);
  // RES-B
  category = response?.find((x) => x.idCategory === 31);
  expect(category?.percentage).toBeCloseTo(100, 2);
  // RES should be 100 because of previous RES-A course
  category = response?.find((x) => x.idCategory === 23);
  expect(category?.percentage).toBeCloseTo(100, 2);

  // try removing a course from the req list
  course = courses.find((x) => x.idCourse === 27);
  if (course !== undefined) {
    const removeResponse = reqCheck.removeCourseFromRequirements(course, reqs, null);
    expect(removeResponse?.major).toBe(null);
    expect(removeResponse?.gen).not.toBe(null);
    expect(removeResponse.gen?.find((x) => x.idCategory === 30)?.percentage).toBeCloseTo(0, 2);
    expect(removeResponse.gen?.find((x) => x.idCategory === 23)?.percentage).toBeCloseTo(50, 2);
  }

  // test a gen ed with a course req list
  course = courses.find((x) => x.idCourse === 139);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
    category = response?.find((x) => x.idCategory === 24);
    expect(category?.percentage).toBeCloseTo(33.33, 2);
    const removeResponse = reqCheck.removeCourseFromRequirements(course, reqs, null);
    expect(removeResponse?.major).toBe(null);
    expect(removeResponse?.gen).not.toBe(null);
    expect(removeResponse.gen?.find((x) => x.idCategory === 24)?.percentage).toBeCloseTo(0, 2);
  }
});

// This test checks requirements that have children are processed correctly
test("Check ART/HUM or SBSCI Requirements Processing", async () => {
  // get general requirements
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements/gen"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get general education courses
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/geneds"
  );
  let multipleCats: { idString: string; categories: number[]; }[] = [];
  multipleCats = createMultipleCategories(courses, multipleCats);
  const reqCheck = new RequirementsProcessing();
  // add several SBSCI courses then remove one
  let response;
  let category;
  // Under SBSCI - ECON
  let course = courses.find((x) => x.idCourse === 83);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
  }
  category = response?.find((x) => x.idCategory === 43);
  expect(category?.percentage).toBeCloseTo(100, 2);
  category = response?.find((x) => x.idCategory === 27);
  expect(category?.percentage).toBeCloseTo(50, 2);

  // Under SBSCI - ECON
  course = courses.find((x) => x.idCourse === 82);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
  }
  category = response?.find((x) => x.idCategory === 43);
  expect(category?.percentage).toBeCloseTo(100, 2);
  category = response?.find((x) => x.idCategory === 27);
  // has to come from two categories so should be 50%
  expect(category?.percentage).toBeCloseTo(50, 2);

  // Under SBSCI - GEOGRAPHY
  course = courses.find((x) => x.idCourse === 11);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
    category = response?.find((x) => x.idCategory === 44);
    expect(category?.percentage).toBeCloseTo(100, 2);
    category = response?.find((x) => x.idCategory === 27);
    expect(category?.percentage).toBeCloseTo(100, 2);
    const removeResponse = reqCheck.removeCourseFromRequirements(course, reqs, null);
    expect(removeResponse?.major).toBe(null);
    expect(removeResponse?.gen).not.toBe(null);
    expect(removeResponse.gen?.find((x) => x.idCategory === 43)?.percentage).toBeCloseTo(100, 2);
    // Has to come from two categories so should be 50%
    expect(removeResponse.gen?.find((x) => x.idCategory === 27)?.percentage).toBeCloseTo(50, 2);
  }
});

// This checks that ARNS requirements process their children correctly
test("Check ARNS Requirements Processing", async () => {
  // Get general requirements
  const reqs: RequirementComponentType[] = await fetchApiJson(
    "/api/requirements/gen"
  );
  // update database reqs to the req type we use
  reqs.forEach((req) => { req.courseCountTaken = 0; req.coursesTaken = ""; req.creditCountTaken = 0; req.percentage = 0; });
  // get gen ed courses
  const courses: CourseType[] = await fetchApiJson(
    "/api/courses/geneds"
  );
  // go through each item in the array to get any with duplicate categories
  let multipleCats: { idString: string; categories: number[]; }[] = [];
  multipleCats = createMultipleCategories(courses, multipleCats);

  let response;
  let category;
  const reqCheck = new RequirementsProcessing();

  // test adding and removing ARNS courses
  // NAT SCI LAB
  let course = courses.find((x) => x.idCourse === 73);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
  }
  // ARNS - NAT SCI LAB
  category = response?.find((x) => x.idCategory === 33);
  expect(category?.percentage).toBeCloseTo(100, 2);

  // physics astronomy
  course = courses.find((x) => x.idCourse === 194);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
  }
  // ARNS NAT SCI lab
  category = response?.find((x) => x.idCategory === 33);
  expect(category?.percentage).toBeCloseTo(100, 2);
  // ARNS parent
  category = response?.find((x) => x.idCategory === 25);
  expect(category?.percentage).toBeCloseTo(50, 2);
  // Calc 1
  course = courses.find((x) => x.idCourse === 176);
  if (course !== undefined) {
    response = reqCheck.checkRequirementsGen(course, multipleCats, reqs, courses);
    // ARNS math and stat
    category = response?.find((x) => x.idCategory === 32);
    expect(category?.percentage).toBeCloseTo(100, 2);
    // ARNS parent
    category = response?.find((x) => x.idCategory === 25);
    expect(category?.percentage).toBeCloseTo(100, 2);
    const removeResponse = reqCheck.removeCourseFromRequirements(course, reqs, null);
    expect(removeResponse.major).toBe(null);
    expect(removeResponse.gen).not.toBe(null);
    expect(removeResponse.gen?.find((x) => x.idCategory === 25)?.percentage).toBeCloseTo(50, 2);
    expect(removeResponse.gen?.find((x) => x.idCategory === 32)?.percentage).toBeCloseTo(0, 2);
  }
});

// This function creates the list of courses in multiple categories which is usually done in the fourYearPlanPage
function createMultipleCategories(courses: CourseType[], multipleCats: { idString: string; categories: number[]; }[]): any {
  for (let i = 0; i < courses.length; i++) {
    let skip = false;
    // check that we haven't already added this on to the array
    for (let k = 0; k < multipleCats.length; k++) {
      if (courses[i].subject + "-" + courses[i].number === multipleCats[k].idString) {
        skip = true;
      }
    }
    // only look for more if this one isn't recorded
    if (!skip) {
      const currentIdString = courses[i].subject + "-" + courses[i].number;
      const tempCatArr: number[] = [];
      for (let j = i; j < courses.length; j++) {
        if (currentIdString === courses[j].subject + "-" + courses[j].number) {
          tempCatArr.push(courses[j].idCategory);
        }
      }
      if (tempCatArr.length > 1) {
        multipleCats.push({ idString: currentIdString, categories: tempCatArr });
      }
    }
  }
  return multipleCats;
}
