import React, { useState, useEffect } from "react";
import { CourseType } from "../entities/four_year_plan";

interface CourseFilteringProps {
  courseData: CourseType[],
  onFiltered: (courses: CourseType[]) => void
}

export default function CourseFiltering(props: CourseFilteringProps): JSX.Element {
  props.onFiltered(props.courseData);
  return (<div>HELLO</div>);
}
