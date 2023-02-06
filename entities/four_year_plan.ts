export interface MajorType {
  id: number;
  name: string;
  concentrationId: number;
}

export interface ConcentrationType {
  idConcentration: number;
  name: string;
  fourYearPlan: string;
}

export interface CourseType {
  credits: number;
  name: string;
  subject: string;
  number: number;
  semesters: string;
  type: string;
  preReq: string;
  dragSource: string;
  warningYellowColor?: boolean;
  warningOrangeColor?: boolean;
  warningRedColor?: boolean;
  id: number;
  idCategory: number;
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
