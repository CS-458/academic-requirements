import React, { useEffect, useState } from "react";
import PassThrough from "../components/PassThrough";
import { userMajor, UserMajor } from "../services/user";
import Router from "next/router";

function App(): JSX.Element {
  /* Variables to store necessary info */
  const [user, setUser] = useState<UserMajor | undefined>();

  useEffect(() => {
    const user = userMajor();
    if (user === undefined) {
      Router.replace("/").catch(console.error);
    } else {
      setUser(user);
    }
  }, []);

  if (user === undefined) {
    return <></>;
  }
  return (
    <PassThrough
      showing={true}
      data-testid="FourYearPage"
    />
  );
}

export default App;
