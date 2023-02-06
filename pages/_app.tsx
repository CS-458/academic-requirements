/* istanbul ignore file */

import "../styles/globals.css";

import "../styles/App.css";
import "../styles/DeleteableInput.css";
import "../styles/DraggableCourse.css";
import "../styles/SearchableDropdown.css";

import type { AppProps } from "next/app";
import DefaultLayout from "../components/layout/DefaultLayout";
import React from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Hydrate
          state={
            // @ts-expect-error
            pageProps.dehydratedState
          }
        >
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
