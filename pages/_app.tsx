/* istanbul ignore file */

import "../styles/globals.css";

import "../styles/App.css";
import "../styles/DeleteableInput.css";
import "../styles/DraggableCourse.css";
import "../styles/SearchableDropdown.css";

import type { AppProps } from "next/app";
import DefaultLayout from "../components/layout/DefaultLayout";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <DefaultLayout>
        <Component {...pageProps} />
      </DefaultLayout>
    </>
  );
}

export default MyApp;
