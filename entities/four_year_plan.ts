import type { TargetType } from "dnd-core";

// Defines the major object we are passing between files
export interface MajorType {
  id: number; // database major id
  name: string; // name of the major
}

// Defines the concentration object we are passing between files
export interface ConcentrationType {
  idConcentration: number; // Database concentration id
  name: string; // concentration name
  fourYearPlan: string; // this is a json of a fourYearPlan stored in a string
}

// Defines the course object as it is used in most locations
export interface CourseType {
  credits: number; // number of credits a course has
  name: string; // course name
  number: string; // course number STORED IN DATABASE AS STRING
  semesters: string; // whether it runs in fall or spring (FA or SP) or null (runs both)
  subject: string; // course subject i.e. CS, MATH
  preReq: string; // string containing prerequisite courses in a special format
  category: string; // the category the course falls into
  idCourse: number; // Database course id
  idCategory: number; // Database id for the category
  dragSource: string; // Which element it came from i.e. "Semester 1" or CourseList
}

// Defines the actual draggable course object type
export interface DragCourseType {
  name: string, // see CourseType
  subject: string, // see CourseType
  number: string, // see CourseType
  type: string, // Don't worry about this, all assigned to course
  credits: number, // see CourseType
  semesters: string, // see CourseType
  preReq: string, // see CourseType
  dragSource: string, // see CourseType
  warningYellowColor: boolean, // If the course is in multiple semesters
  warningOrangeColor: boolean, // If the course is in the wrong semester fall vs spring
  warningRedColor: boolean, // If the course has a prereq error
  idCourse: number, // see CourseType
  idCategory: number // see CourseType
}

// Defines the props for the course list component
export interface CourseListType {
  accept: TargetType; // makes it a drop target
  onDrop: (item: any) => void; // function for what to do on drop
  courses: CourseType[]; // list of courses it displays for dragging
}

// Defines a requirement as it comes from the database
export interface RequirementType {
  courseCount: number; // number of courses required to satisfy
  courseReqs: string; // list of courses required to satisfy
  creditCount: number; // number of credits required to satisfy
  idCategory: number; // Database id for requirement
  name: string; // name of the requirement
  parentCategory: number; // Database id for parent requirement category
}

// Defines the saved information for each requirement
export interface RequirementComponentType {
  courseCount: number; // number of courses required to satisfy
  courseReqs: string; // list of courses required to satisfy
  creditCount: number; // number of credits required to satisfy
  idCategory: number; // Database id for requirement
  name: string; // name of the requirement
  parentCategory: number; // Database id for parent requirement category
  percentage: number; // Percentage that requirement has been filled
  inheritedCredits: number; // Number of credits a parent req inherits from child req
  coursesTaken: string; // list of courses already used toward requirement
  courseCountTaken: number; // number of courses taken towards requirement
  creditCountTaken: number; // number of credits taken towards requirement
}

// Defines a list of Requirements
export interface RequirementsType {
  [category: number]: RequirementType;
}

// Defines a list of courses in more than one category for requirements
export interface MultipleCategoriesType {
  categories: number[]; // list of category IDs the course falls under
  idString: string; // an identifier for the course i.e. CS-144
}

// Defines the properties of a semester component
export interface SemesterProps {
  accept: TargetType; // makes it a drop target, don't worry about it
  onDrop: (item: any) => void; // function for when an item is dropped
  semesterNumber: number; // the number of the semester
  courses: DragCourseType[]; // a list of courses in the semester
  SemesterCredits: number; // total credits of all courses in semester
  Warning: string; // credit warning (low or high)
  warningPrerequisiteCourses: DragCourseType[]; // list of courses in with prereq issues
  warningFallvsSpringCourses: DragCourseType[]; // list of courses with semester issues
  warningDuplicateCourses: DragCourseType[]; // list of courses in more than one semester
}

// Defines the properties of a semester object
export interface SemesterType {
  accepts: string[], // this is just a course constant
  semesterNumber: number, // number of the semester
  courses: CourseType[], // list of courses in semester
  SemesterCredits: number, // number of credits in the semester
  Warning: string // credit warning (high or low)
}
