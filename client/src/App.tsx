import { useState } from "react";
import Button from "./components/Button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen gap-4">
        <Button type="primary">Primary Button</Button>
        <Button type="secondary">Secondary Button</Button>
        <Button type="tertiary">Tertiary Button</Button>
      </div>
    </>
  );
}

export default App;
