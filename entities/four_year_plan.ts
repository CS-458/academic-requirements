export interface MajorType {
  id: number;
  name: string;
  // concentrations: Array<{ id: number; name: string }>;
}

export interface ConcentrationType {
  idConcentration: number;
  name: string;
  fourYearPlan: string;
}

export interface CourseType {
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
}

export interface DragCourseType {
  name: string,
  subject: string,
  number: number,
  type: string,
  credits: number,
  semesters: string,
  preReq: string,
  dragSource: string,
  warningYellowColor: any,
  warningOrangeColor: any,
  warningRedColor: any,
  idCourse: number,
  idCategory: number
}

export interface CourseListType {
  accept: CourseType;
  onDrop: (item: any) => void;
  courses: CourseType[];
}

export interface RequirementType {
  courseCount: number;
  courseReqs: string;
  creditCount: number;
  idCategory: number;
  name: string;
  parentCategory: number;
}

export interface Requirements {
  [category: number]: RequirementType;
}
