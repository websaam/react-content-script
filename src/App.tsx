/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import { Logo } from "../components/Logo";
import "./App.css";
function App() {
  return (
    <div className="App">
      <Logo />
      <h1>DocuQuest</h1>
    </div>
  );
}

export default App;
