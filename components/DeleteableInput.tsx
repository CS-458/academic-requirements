import React from "react";
import { ReactComponent as XSymbol } from "../public/xSymbol.svg";
import clsx from "clsx";

const DeleteableInput = (props: {
  text?: string;
  thinWidth: boolean;
}): JSX.Element => {
  console.log("DeletableInp: ", props.text);
  // <XSymbol className="x" />
  return (
    <div
      className={clsx("container", props.thinWidth && "thin")}
      key={`${props.text}`}
    >
      {`${props.text}`}
    </div>
  );
};

export default DeleteableInput;
