import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClient, QueryClientProvider } from "react-query";

/**
 *  Wrap Elements with QueryClient & DndProvider similar to _app.tsx
 * */
export function wrapper(children: JSX.Element | JSX.Element[]): JSX.Element {
  // <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
