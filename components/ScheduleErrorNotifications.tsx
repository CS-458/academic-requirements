import React from "react";

export default function ScheduleErrorNotification(props: { errors: string[] }): JSX.Element {
  const { errors } = props;
  /* Will have tooltip and popper */

  return (
     <div>{errors.join(", ")}</div>
  );
}
