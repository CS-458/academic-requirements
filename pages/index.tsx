import React, { useEffect, useState } from "react";
import InputPage from "../components/InputPage";
import ErrorPopup from "../components/ErrorPopup";
import { MajorType, ConcentrationType } from "../entities/four_year_plan";
function App(): JSX.Element {
  // majorData is an array of major objects returned from the database
  // const [majorData, setMajorData] = useState<any[]>([]);
  // majorDisplayData is an array of the 'name' of the major objects for display purposes
  // const [majorDisplayData, setMajorDisplayData] = useState<any[]>([]);
  // majorCode is an array of the 'idMajor' of the major objects for query purposes
  const [majorCode, setMajorCode] = useState();

  // concentrationData is an array of concentration objects
  // const [concentrationData, setConcentrationData] = useState<any[]>([]);
  // concentrationDisplayData is an array of the 'name' of the concentration objects
  // const [concentrationDisplayData, setConcentrationDisplayData] = useState<
  //   any[]
  // >([]);
  // concentrationCode is an array of the 'idConcentration' of the concentration objects
  const [concentrationCode, setConcentrationCode] = useState();

  // majorCourseData is an array of course objects related to the major
  const [_1, setMajorCourseData] = useState([]);
  // concentrationCourseData is an array of the course object related to the concentration
  const [_2, setConcentrationCourseData] = useState([]);
  // genEdCourseData is an array of the course object for general education courses
  const [_3, setGenEdCourseData] = useState([]);

  const [major, setMajor] = useState<MajorType>();
  const [concentration, setConcentration] = useState<ConcentrationType | null>();

  // requirements for the concentration
  const [_4, setRequirementsData] = useState([]);

  // general requirements
  const [_5, setRequirementsGenData] = useState([]);

  // Flag for using a four year plan
  const [_6, setUseFourYearPlan] = useState(false);
  const [fourYearPlan, setFourYearPlan] = useState(null);

  // courseSubjects the array of subject strings from the database
  // const [courseSubjects, setCourseSubjects] = useState<any[]>([]);
  // selectedCourseSubject is the specific course subject selected
  // On update, a useEffect is called to get the respective numbers
  // const [selectedCourseSubject, setSelectedCourseSubject] = useState("");
  // courseSubjectNumbers the array of number (as strings) from the database
  // const [courseSubjectNumbers, setCourseSubjectNumbers] = useState([]);

  const [coursesTaken, setCoursesTaken] = useState<string[]>([]);

  // Functions and variables for controlling an error popup
  const [visibility, setVisibility] = useState(false);
  const popupCloseHandler = (): void => {
    setVisibility(false);
  };
  const [error, setError] = useState("");
  function throwError(error: string): void {
    setVisibility(true);
    setError(error);
  }

  // Processes when the user clicks to generate the schedule
  function generateSchedule(
    major: any,
    concentration: any,
    previousCourses: any
  ): void {
    console.log("generate schedule");
    if (major !== "" && concentration !== "") {
      setCoursesTaken(previousCourses);
      setMajor(major);
      setConcentration(concentration);
    } else {
      if (major === "") {
        throwError(
          "No major is selected \n Please select a major before continuing."
        );
      } else {
        throwError(
          "No concentration is selected \n Please select a concentration before continuing."
        );
      }
    }
    // Sends information to the console for manual review
    console.log(`Major: ${major}, Concentration: ${concentration}`);
    console.log("Courses taken: ");
    previousCourses.forEach((course: any): void => {
      console.log(`${course}, `);
    });
  }
  // Sets major to the selected major from the dropdown
  // function selectMajor(selectedMajor: any): void {
  //   setMajor(selectedMajor);
  // }

  // Sets concentration to the selected concentration from the dropdown
  // function selectConcentration(selectedConcentration: any): void {
  //   setConcentration(selectedConcentration);
  // }

  // Runs on startup
  // Get all the data that doesn't need user input
  // useEffect(() => {
  // fetch("/api/major") // create similar
  //   .then(async (res) => await res.json())
  //   .then((result) => {
  //     // Sets majorData to result from database query
  //     setMajorData(result);
  //     // Gets the 'name' of the major objects
  //     const temp: any[] = [];
  //     result.forEach((x: any) => {
  //       temp.push(x.name);
  //     });
  //     // Sets majorDisplayData to the 'name' of the majors
  //     setMajorDisplayData(temp);
  //   })
  //   .catch(() => {});
  // fetch("/api/subjects")
  //   .then(async (res) => await res.json())
  //   .then((result) => {
  //     const temp: any[] = [];
  //     result.forEach((x: any) => {
  //       temp.push(x.subject);
  //     });
  //     // get Course subject data, pass in the result
  //     setCourseSubjects(temp);
  //   })
  //   .catch(() => {});
  //   fetch("/api/courses/geneds")
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       setGenEdCourseData(result);
  //     })
  //     .catch(() => {});
  // }, []);

  // Runs whenever a course subject has been selected
  // Gets the array of course number for that subject from the API
  // useEffect(() => {
  //   fetch(`/api/subjects/numbers?sub=${selectedCourseSubject}`)
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       const temp: any = [];
  //       result.forEach((x: any) => {
  //         temp.push(x.number);
  //       });
  //       setCourseSubjectNumbers(temp);
  //     })
  //     .catch(console.error);
  // }, [selectedCourseSubject]);

  // Gets the concentrations from the database based on the 'idMajor' of the selected major
  // Runs when majorCode is updated
  // useEffect(() => {
  //   fetch(`/api/concentration?majid=${majorCode}`)
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       // Sets concentrationData to result from database query
  //       setConcentrationData(result);
  //       // Gets the 'name' of the concentration objects
  //       const temp: any[] = [];
  //       result.forEach((x: any) => {
  //         temp.push(x.name);
  //       });
  //       // Sets concentrationDisplayData to the 'name' of the concentrations
  //       setConcentrationDisplayData(temp);
  //     })
  //     .catch(console.error);
  // }, [majorCode]); // gets called whenever major is updated

  // Gets the courses related to the 'idMajor' of the selected major
  // Runs when majorCode is updated
  // useEffect(() => {
  //   fetch(`/api/courses/major?majid=${major?.concentrationId}`)
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       // Sets majorCourseData to the result from the query
  //       setMajorCourseData(result);
  //     })
  //     .catch(console.error);
  // }, [major]);

  // Gets the courses related to the 'idConcentration' of the selected concentration
  // Runs when concentrationCode is updated
  // useEffect(() => {
  //   fetch(`/api/courses/concentration?conid=${concentration?.idConcentration}`)
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       console.log("result", result);
  //       // Sets concentrationCourseData to the result from the query
  //       setConcentrationCourseData(result);
  //     })
  //     .catch(console.error);
  // }, [concentration?.idConcentration]);

  // Gets the requirements related to the major/concentration
  // useEffect(() => {
  //   fetch(`/api/requirements?conid=${concentration?.id}`)
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       // Sets concentrationCourseData to the result from the query
  //       console.log("requirements", result);
  //       setRequirementsData(result);
  //     })
  //     .catch(console.error);
  // }, [concentration]);

  // Gets the requirements related to the major/concentration
  // useEffect(() => {
  //   fetch(`/api/requirements/gen?conid=${concentration?.id}`)
  //     .then(async (res) => await res.json())
  //     .then((result) => {
  //       // Sets concentrationCourseData to the result from the query
  //       setRequirementsGenData(result);
  //     })
  //     .catch(console.error);
  // }, [concentration]);

  // Gets the 'idMajor' relating to the 'name' of the selected major
  // Runs when major is updated
  // useEffect(() => {
  //   for (let i = 0; i < majorData.length; i++) {
  //     if (majorDisplayData[i] === major) {
  //       // Sets the majorCode to the 'idMajor' of the selected major
  //       setMajorCode(majorData[i].idMajor);
  //       // Whenever the major is updated, the existing four year plan and concentration
  //       // are potentially invalid, so reset them.
  //       setFourYearPlan(null);
  //       setConcentration(null);
  //     }
  //   }
  // }, [major]);

  // Gets the 'idConcentration' relating to the 'name' of the selected major
  // Runs when concentration is updated
  // useEffect(() => {
  //   for (let i = 0; i < concentrationData.length; i++) {
  //     if (concentrationDisplayData[i] === concentration) {
  //       // Sets the concentrationCode to the 'idConcentration' of the selected concentration
  //       setConcentrationCode(concentrationData[i].idConcentration);
  //       setFourYearPlan(JSON.parse(concentrationData[i].fourYearPlan));
  //     }
  //   }
  // }, [concentration]);

  const [data, setData] = useState<any | null>(null);

  function importData(data: any): void {
    setData(data);
  }
  useEffect(() => {
    if (data !== null) {
      fetch(`/api/majorID?mname=${data.Major}`)
        .then(async (res) => await res.json())
        .then((result) => {
          // Sets concentrationCourseData to the result from the query
          setMajor(result[0]);
        })
        .catch(console.error);
      fetch(`/api/concentrationID?cname=${data.Concentration}`)
        .then(async (res) => await res.json())
        .then((result) => {
          // Sets concentrationCourseData to the result from the query
          setConcentration(result[0]);
        })
        .catch(console.error);
    }
  }, [data]);

  return (
    <div>
      <InputPage
        // onClickGenerate={generateSchedule}
        // onClickMajor={selectMajor}
        // onClickConcentration={selectConcentration}
        // concentrationList={concentrationData}
        // majorList={majorData}
        // majorDisplayList={majorDisplayData}
        // concentrationDisplayList={concentrationDisplayData}
        // takenCourses={coursesTaken}
        // setTakenCourses={setCoursesTaken}
        // setUseFourYearPlan={setUseFourYearPlan}
        // concentrationHasFourYearPlan={fourYearPlan != null}
        // courseSubjectAcronyms={courseSubjects}
        // setSelectedCourseSubject={setSelectedCourseSubject}
        // courseSubjectNumbers={courseSubjectNumbers}
        importData={importData}
      />
      <ErrorPopup
        onClose={popupCloseHandler}
        show={visibility}
        title="Error"
        error={error}
      />
    </div>
  );
}

export default App;
