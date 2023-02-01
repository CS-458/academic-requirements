import React, { useEffect, useState } from "react";
import FourYearPlanPage from "../components/FourYearPlanPage";
import ErrorPopup from "../components/ErrorPopup";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App(): JSX.Element {
  /* Variables to store necessary info */

  // majorData is an array of major objects returned from the database
  const [majorData, setMajorData] = useState<any[]>([]);
  // majorDisplayData is an array of the 'name' of the major objects for display purposes
  const [majorDisplayData, setMajorDisplayData] = useState<string[]>([]);
  // majorCode is an array of the 'idMajor' of the major objects for query purposes
  const [majorCode, setMajorCode] = useState();

  // concentrationData is an array of concentration objects
  const [concentrationData, setConcentrationData] = useState<any[]>([]);
  // concentrationDisplayData is an array of the 'name' of the concentration objects
  const [concentrationDisplayData, setConcentrationDisplayData] = useState<
  string[]
  >([]);
  // concentrationCode is an array of the 'idConcentration' of the concentration objects
  const [concentrationCode, setConcentrationCode] = useState();

  // majorCourseData is an array of course objects related to the major
  const [majorCourseData, setMajorCourseData] = useState([]);
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
  const [fourYearPlan, setFourYearPlan] = useState(null);

  // courseSubjects the array of subject strings from the database
  const [_0, setCourseSubjects] = useState<string[]>([]);
  // selectedCourseSubject is the specific course subject selected
  // On update, a useEffect is called to get the respective numbers
  const [selectedCourseSubject] = useState("");
  // courseSubjectNumbers the array of number (as strings) from the database
  const [_1, setCourseSubjectNumbers] = useState<string[]>([]);

  const [coursesTaken] = useState([]);

  // Functions and variables for controlling an error popup
  const [visibility, setVisibility] = useState(false);
  const popupCloseHandler = (): void => {
    setVisibility(false);
  };
  const [error] = useState("");

  // Runs on startup
  // Get all the data that doesn't need user input
  useEffect(() => {
    fetch("/major") // create similar
      .then(async (res) => await res.json())
      .then((result) => {
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
      .catch(() => {});
    fetch("/subjects")
      .then(async (res) => await res.json())
      .then((result) => {
        const temp: string[] = [];
        result.forEach((x: any) => {
          temp.push(x.subject);
        });
        // get Course subject data, pass in the result
        setCourseSubjects(temp);
      })
      .catch(() => {});
    fetch("/courses/geneds")
      .then(async (res) => await res.json())
      .then((result) => {
        setGenEdCourseData(result);
      })
      .catch(() => {});
  }, []);

  // Runs whenever a course subject has been selected
  // Gets the array of course number for that subject from the API
  useEffect(() => {
    fetch(`/subjects/numbers?sub=${selectedCourseSubject}`)
      .then(async (res) => await res.json())
      .then((result) => {
        const temp: string[] = [];
        result.forEach((x: any) => {
          temp.push(x.number);
        });
        setCourseSubjectNumbers(temp);
      })
      .catch(() => {});
  }, [selectedCourseSubject]);

  // Gets the concentrations from the database based on the 'idMajor' of the selected major
  // Runs when majorCode is updated
  useEffect(() => {
    fetch(`/concentration?majid=${majorCode}`)
      .then(async (res) => await res.json())
      .then((result) => {
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
      .catch(() => {});
  }, [majorCode]); // gets called whenever major is updated

  // Gets the courses related to the 'idMajor' of the selected major
  // Runs when majorCode is updated
  useEffect(() => {
    fetch(`/courses/major?majid=${majorCode}`)
      .then(async (res) => await res.json())
      .then((result) => {
        // Sets majorCourseData to the result from the query
        setMajorCourseData(result);
      })
      .catch(() => {});
  }, [majorCode]);

  // Gets the courses related to the 'idConcentration' of the selected concentration
  // Runs when concentrationCode is updated
  useEffect(() => {
    fetch(`/courses/concentration?conid=${concentrationCode}`)
      .then(async (res) => await res.json())
      .then((result) => {
        console.log("result", result);
        // Sets concentrationCourseData to the result from the query
        setConcentrationCourseData(result);
      })
      .catch(() => {});
  }, [concentrationCode]);

  // Gets the requirements related to the major/concentration
  useEffect(() => {
    fetch(`/requirements?conid=${concentrationCode}`)
      .then(async (res) => await res.json())
      .then((result) => {
        // Sets concentrationCourseData to the result from the query
        console.log("requirements", result);
        setRequirementsData(result);
      })
      .catch((e) => console.error(e));
  }, [concentrationCode]);

  // Gets the requirements related to the major/concentration
  useEffect(() => {
    fetch(`/requirements/gen?conid=${concentrationCode}`)
      .then(async (res) => await res.json())
      .then((result) => {
        // Sets concentrationCourseData to the result from the query
        setRequirementsGenData(result);
      })
      .catch((e) => console.error(e));
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

  const [data, setData] = useState<any | null>(null);

  function importData(data: any): void {
    setData(data);
  }
  useEffect(() => {
    if (data !== null) {
      fetch(`/majorID?mname=${data.Major}`)
        .then(async (res) => await res.json())
        .then((result) => {
          // Sets concentrationCourseData to the result from the query
          setMajorCode(result[0].idMajor);
        })
        .catch(() => {});
      fetch(`/concentrationID?cname=${data.Concentration}`)
        .then(async (res) => await res.json())
        .then((result) => {
          // Sets concentrationCourseData to the result from the query
          setConcentrationCode(result[0].idConcentration);
        })
        .catch(() => {});
    }
  }, [data]);

  return (
    <DndProvider backend={HTML5Backend}>
      <FourYearPlanPage
        data-testid="FourYearPage"
        concentrationCourseList={concentrationCourseData}
        majorCourseList={majorCourseData}
        genEdCourseList={genEdCourseData}
        selectedMajor={major}
        selectedConcentration={concentration}
        completedCourses={coursesTaken}
        requirements={requirements}
        requirementsGen={requirementsGen}
        fourYearPlan={useFourYearPlan ? fourYearPlan : null}
        importData={data}
      />
      <ErrorPopup
        onClose={popupCloseHandler}
        show={visibility}
        title="Error"
        error={error}
      />
    </DndProvider>
  );
}

export default App;
