import React, { useState } from "react";
import InputPage from "../components/InputPage";
function App(): JSX.Element {
  const [data, setData] = useState<any | null>(null);

  function importData(data: any): void {
    setData(data);
  }

  return (
    <div>
      <InputPage
        importData={importData}
      />
    </div>
  );
}

export default App;
