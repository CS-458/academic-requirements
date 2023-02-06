import React, { useEffect, useState } from "react";
import PassThrough from "../components/PassThrough";
import ErrorPopup from "../components/ErrorPopup";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { userMajor, UserMajor } from "../services/user";
import Router from "next/router";
import { fetchApi } from "../services/util";

function App(): JSX.Element {
  /* Variables to store necessary info */
  const [user, setUser] = useState<UserMajor | undefined>();

  // majorData is an array of major objects returned from the database
  const [majorData, setMajorData] = useState<any[]>([]);
  // majorDisplayData is an array of the 'name' of the major objects for display purposes
  const [majorDisplayData, setMajorDisplayData] = useState<string[]>([]);
  // majorCode is an array of the 'idMajor' of the major objects for query purposes
  const [majorCode, setMajorCode] = useState<number | undefined>(user?.major);

  // concentrationData is an array of concentration objects
  const [concentrationData, setConcentrationData] = useState<any[]>([]);
  // concentrationDisplayData is an array of the 'name' of the concentration objects
  const [concentrationDisplayData, setConcentrationDisplayData] = useState<
    string[]
  >([]);
  // concentrationCode is an array of the 'idConcentration' of the concentration objects
  const [concentrationCode, setConcentrationCode] = useState<
    number | undefined
  >(user?.concentration);

  // majorCourseData is an array of course objects related to the major
  const [majorCourseData, setMajorCourseData] = useState<
    Array<{
      credits: number;
      name: string;
      number: number;
      semesters: string;
      subject: string;
      preReq: string;
      category: string;
      id: number;
      idCategory: number;
    }>
  >([]);
  // concentrationCourseData is an array of the course object related to the concentration
  const [concentrationCourseData, setConcentrationCourseData] = useState([]);
  // genEdCourseData is an array of the course object for general education courses
  const [genEdCourseData, setGenEdCourseData] = useState([]);

  const [major] = useState("");
  const [concentration, setConcentration] = useState<string | null>("");

  // requirements for the concentration
  const [requirements, setRequirementsData] = useState([]);

  // general requirements
  const [requirementsGen, setRequirementsGenData] = useState([]);

  // Flag for using a four year plan
  const [useFourYearPlan] = useState(false);
  const [fourYearPlan, setFourYearPlan] = useState(undefined);

  // courseSubjects the array of subject strings from the database
  const [_0, setCourseSubjects] = useState<string[]>([]);
  // selectedCourseSubject is the specific course subject selected
  // On update, a useEffect is called to get the respective numbers
  const [selectedCourseSubject] = useState("");
  // courseSubjectNumbers the array of number (as strings) from the database
  const [_1, setCourseSubjectNumbers] = useState<string[]>([]);

  const [coursesTaken] = useState([]);

  // Runs on startup
  // Get all the data that doesn't need user input
  useEffect(() => {
    fetchApi("/api/major") // create similar
      .then((result: any) => {
        // Sets majorData to result from database query
        setMajorData(result);
        // Gets the 'name' of the major objects
        const temp: string[] = [];
        result.forEach((x: any) => {
          temp.push(x.name);
        });
        // Sets majorDisplayData to the 'name' of the majors
        setMajorDisplayData(temp);
      })
      .catch(console.error);
    fetchApi("/api/subjects")
      .then((result: any) => {
        const temp: string[] = [];
        result.forEach((x: any) => {
          temp.push(x.subject);
        });
        // get Course subject data, pass in the result
        setCourseSubjects(temp);
      })
      .catch(console.error);
    fetchApi("/api/courses/geneds")
      .then((result: any) => {
        setGenEdCourseData(result);
      })
      .catch(console.error);
  }, []);

  // Runs whenever a course subject has been selected
  // Gets the array of course number for that subject from the API
  useEffect(() => {
    fetchApi(`/api/subjects/numbers?sub=${selectedCourseSubject}`)
      .then((result: any) => {
        const temp: string[] = [];
        result.forEach((x: any) => {
          temp.push(x.number);
        });
        setCourseSubjectNumbers(temp);
      })
      .catch(console.error);
  }, [selectedCourseSubject]);

  // Gets the concentrations from the database based on the 'idMajor' of the selected major
  // Runs when majorCode is updated
  useEffect(() => {
    fetchApi(`/api/concentration?majid=${majorCode}`)
      .then((result: any) => {
        // Sets concentrationData to result from database query
        setConcentrationData(result);
        // Gets the 'name' of the concentration objects
        const temp: string[] = [];
        result.forEach((x: any) => {
          temp.push(x.name);
        });
        // Sets concentrationDisplayData to the 'name' of the concentrations
        setConcentrationDisplayData(temp);
      })
      .catch(console.error);
  }, [majorCode]); // gets called whenever major is updated

  // Gets the courses related to the 'idMajor' of the selected major
  // Runs when majorCode is updated
  useEffect(() => {
    fetchApi(`/api/courses/major?majid=${majorCode}`)
      .then((result: any) => {
        // Sets majorCourseData to the result from the query
        setMajorCourseData(result);
      })
      .catch(console.error);
  }, [majorCode]);

  // Gets the courses related to the 'idConcentration' of the selected concentration
  // Runs when concentrationCode is updated
  useEffect(() => {
    fetchApi(`/api/courses/concentration?conid=${concentrationCode}`)
      .then((result: any) => {
        console.log("result", result);
        // Sets concentrationCourseData to the result from the query
        setConcentrationCourseData(result);
      })
      .catch(console.error);
  }, [concentrationCode]);

  // Gets the requirements related to the major/concentration
  useEffect(() => {
    fetchApi(`/api/requirements?conid=${concentrationCode}`)
      .then((result: any) => {
        // Sets concentrationCourseData to the result from the query
        console.log("requirements", result);
        setRequirementsData(result);
      })
      .catch(console.error);
  }, [concentrationCode]);

  // Gets the requirements related to the major/concentration
  useEffect(() => {
    fetchApi(`/api/requirements/gen?conid=${concentrationCode}`)
      .then((result: any) => {
        // Sets concentrationCourseData to the result from the query
        setRequirementsGenData(result);
      })
      .catch(console.error);
  }, [concentrationCode]);

  // Gets the 'idMajor' relating to the 'name' of the selected major
  // Runs when major is updated
  useEffect(() => {
    for (let i = 0; i < majorData.length; i++) {
      if (majorDisplayData[i] === major) {
        // Sets the majorCode to the 'idMajor' of the selected major
        setMajorCode(majorData[i].idMajor);
        // Whenever the major is updated, the existing four year plan and concentration
        // are potentially invalid, so reset them.
        setFourYearPlan(null);
        setConcentration(null);
      }
    }
  }, [major]);

  // Gets the 'idConcentration' relating to the 'name' of the selected major
  // Runs when concentration is updated
  useEffect(() => {
    for (let i = 0; i < concentrationData.length; i++) {
      if (concentrationDisplayData[i] === concentration) {
        // Sets the concentrationCode to the 'idConcentration' of the selected concentration
        setConcentrationCode(concentrationData[i].idConcentration);
        setFourYearPlan(JSON.parse(concentrationData[i].fourYearPlan));
      }
    }
  }, [concentration]);

  useEffect(() => {
    const user = userMajor();
    if (user === undefined) {
      Router.replace("/").catch(console.error);
    } else {
      setUser(user);
      setMajorCode(user.major);
      setConcentrationCode(user.concentration);
    }
  }, []);

  if (user === undefined) {
    return <></>;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <PassThrough
        showing={true}
        data-testid="FourYearPage"
        concentrationCourseList={concentrationCourseData}
        majorCourseList={majorCourseData}
        genEdCourseList={genEdCourseData}
        selectedMajor={major}
        selectedConcentration={concentration ?? ""}
        completedCourses={coursesTaken}
        requirements={requirements}
        requirementsGen={requirementsGen}
        fourYearPlan={useFourYearPlan ? fourYearPlan : undefined}
      />
    </DndProvider>
  );
}

export default App;
