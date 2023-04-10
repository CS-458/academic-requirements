import InputPage from "../components/InputPage";
import { useEffect } from "react";
function App(): JSX.Element {
  useEffect(() => {
    localStorage.removeItem("current-schedule");
  }, []);
  return <InputPage />;
}

export default App;
