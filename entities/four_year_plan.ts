export interface Major {
  id: number;
  name: string;
  concentrations: Array<{ id: number; name: string }>;
}

export interface Concentration {
  id: number;
  name: string;
  four_year_plan: string;
}

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

export interface Requirements {
  [category: number]: Requirement;
}
