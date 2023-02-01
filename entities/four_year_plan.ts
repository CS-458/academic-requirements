export interface Course {
  credits: number;
  name: string;
  number: number;
  semesters: string;
  subject: string;
  preReq: string;
  category: string;
  id: number;
  idCategory: number;
}

export interface Requirement {
  courseCount: number;
  courseReqs: string;
  creditCount: number;
  idCategory: number;
  name: string;
  parentCategory: number;
}
