/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import Logo from "./Logo";
import "./App.css";
import useCounter from "../../components/useCounter";
import useRandomImage from "../../components/useRandomImage";

function App() {
  const { count, increment, decrement, reset } = useCounter();
  const { imageSrc, loading, error, fetchImage } = useRandomImage();

  return (
    <div className="App">
      <header className="App-header">
        <Logo className="App-logo" id="App-logo" title="React logo" />
        <p>Hello, World!</p>
        <p>I'm a Chrome Extension Content Script!</p>

        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>

        <p>Random Image</p>
        <button onClick={fetchImage}>fetchImage</button>
        {imageSrc && <img src={imageSrc} alt="Random" />}
      </header>
    </div>
  );
}

export default App;
