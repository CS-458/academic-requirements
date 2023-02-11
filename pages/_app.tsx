/* istanbul ignore file */

import "../styles/globals.css";
import "../styles/App.css";
import "../styles/DraggableCourse.css";

import type { AppProps } from "next/app";
import DefaultLayout from "../components/layout/DefaultLayout";
import React from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
          <DndProvider backend={HTML5Backend}>
            <DefaultLayout>
              <Component {...pageProps} />
            </DefaultLayout>
          </DndProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
