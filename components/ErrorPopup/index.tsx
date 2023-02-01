import { useEffect, useState } from "react";
import popupStyles from "./ErrorPopup.module.css";
import PropTypes from "prop-types";
const ErrorPopup = (props: {
  onClose: (show: boolean) => void;
  show: boolean;
  title: string;
  error: string;
}): JSX.Element => {
  const [show, setShow] = useState(false);

  const closeHandler = (_e: any): void => {
    setShow(false);
    props.onClose(false);
  };

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  return (
    <div
      style={{
        visibility: show ? "visible" : "hidden",
        opacity: show ? "1" : "0"
      }}
      className={popupStyles.overlay}
      data-testid="popup"
    >
      <div className={popupStyles.popup}>
        <h2>{props.title}</h2>
        <span className={popupStyles.close} onClick={closeHandler}>
          &times;
        </span>
        <div className={popupStyles.content}>{props.error}</div>
      </div>
    </div>
  );
};

ErrorPopup.propTypes = {
  title: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.string.isRequired
};

export default ErrorPopup;
