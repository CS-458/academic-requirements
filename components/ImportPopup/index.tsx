import { useEffect, useState } from "react";
import popupStyles from "./ImportPopup.module.css";
import PropTypes from "prop-types";

const ImportPopup = (props: {
  onClose: (value: boolean) => void;
  returnData: (data: any) => void;
  import?: JSX.Element | JSX.Element[];
  title: string;
  show: boolean;
}): JSX.Element => {
  const [show, setShow] = useState(false);

  let data;

  const closeHandler = (): void => {
    setShow(false);
    props.onClose(false);
  };

  const [visibility, setVisibility] = useState(false);
  const popupCloseHandler = (): void => {
    setVisibility(false);
  };
  const [error, setError] = useState("");
  function throwError(error: any): void {
    setVisibility(true);
    setError(error);
  }

  /*
  This is the function that calls to process the upload the selected file.
  Right now it does nothing but closed the popup and checks the file type if it's JSON
  TODO: Process info in user uploaded .json file
  */
  const processUpload = (): void => {
    // HTML of the uploaded file
    const filenameElement = document.getElementById("fileName");

    const files = (filenameElement as HTMLInputElement | undefined)?.files;
    const file = files === undefined || files === null ? undefined : files[0];
    let fileName;
    // if file has been selected
    if (files !== undefined && files !== null) {
      // store file name in fileName
      fileName = files.item(0)?.name;
    } else {
      // if file has NOT been selected
      // Close uploader popup and throw error
      closeHandler();
      throwError("No file selected");
      return;
    }
    // if uploaded file is not a json -> throws error
    if (fileName !== null && fileName !== undefined) {
      const fileType = fileName.split(".").pop()?.toLowerCase();
      if (fileType !== "json") {
        closeHandler();
        throwError("Not a JSON File");
      } else if (file !== undefined) {
        // if it is file "uploads"
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        // When the file reader reads the file
        fileReader.onload = () => {
          if (typeof fileReader.result === "string") {
            data = JSON.parse(fileReader.result);
            // Checks to make sure the JSON has the required properties
            if (checkJSON(data)) {
              // Returns JSON data
              props.returnData(data);
            } else {
              throwError("Not a valid file");
            }
          }
        };
        closeHandler();
      }
    }
  };

  function checkJSON(thisData: { ClassPlan?: any }): boolean {
    // Make sure the JSON has Major, Concentration, Completed, and ClassPlan
    if (
      !Object.hasOwn(thisData, "Major") ||
      !Object.hasOwn(thisData, "Concentration") ||
      !Object.hasOwn(thisData, "Completed Courses") ||
      !Object.hasOwn(thisData, "ClassPlan")
    ) {
      return false;
    } else if ("ClassPlan" in thisData) {
      // This is doing the same thing, but it is a level in ClassPlan, so we need to check ClassPlan first
      if (
        !Object.hasOwn(thisData.ClassPlan, "Semester1") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester2") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester3") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester4") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester5") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester6") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester7") ||
        !Object.hasOwn(thisData.ClassPlan, "Semester8")
      ) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  return (
    <div data-testid="errorPagePopup">
      <div
        style={{
          visibility: show ? "visible" : "hidden",
          opacity: show ? "1" : "0"
        }}
        className={popupStyles.overlay}
        data-testid="uploaderPage"
      >
        <div className={popupStyles.popup} data-testid="pie">
          <h2>{props.title}</h2>
          <input type="file" id="fileName" data-testid="chooseFile" />
          <button onClick={processUpload} data-testid="uploadButton">
            Upload
          </button>
          <span className={popupStyles.close} onClick={closeHandler}>
            &times;
          </span>
          <div className={popupStyles.content}>{props.import}</div>
        </div>
      </div>
    </div>
  );
};

ImportPopup.propTypes = {
  title: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  returnData: PropTypes.func.isRequired
};

export default ImportPopup;
