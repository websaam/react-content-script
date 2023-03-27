/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import "./App.css";
import { PromptMaster } from "../../utils/PromptMaster";
import { useChromeStorage } from "../../components/useChromeStorage";
import ApiKeyModal from "../../components/ApiKeyModal";
import { Loading } from "../../components/Loading";
import { useState } from "react";

function App() {
  const [storageValue, setStorageValue, getAllStorage] =
    useChromeStorage("docuquest-api");

  const [loading, setLoading] = useState(false);
  const [promptAnswer, setPromptAnswer] = useState("");

  const handleGetAllStorage = async () => {
    const items = await getAllStorage();
    console.log("items:", items);
    return items;
  };
  
  const getData = async () => {
    const storageItems = await handleGetAllStorage();

    const openaiKey = storageItems["docuquest-api"] as string;

    if (!openaiKey || typeof openaiKey !== "string") {
      const msg = "No openaiKey key found";
      alert(msg);
      console.error(msg);
      return;
    }

    const body = document.querySelector("body");
    const promptMaster = new PromptMaster({
      input: body!.innerText,
      apiKey: openaiKey,
      engine: "gpt-3.5-turbo",
    });

    setLoading(true);
    const data = await promptMaster.context(`Summarize the following text:"`);
    setLoading(false);
    console.log("data:", data);
    setPromptAnswer(data);
  };

  return (
    <div className="app-docuquest">
      <h1>🤓 DocuQuest</h1>
      <div className="flex">
        <ApiKeyModal
          keyName={"docuquest-api"}
          setKey={setStorageValue}
          keyValue={storageValue}
        />

        <>
          {storageValue && (
            <>
              {loading ? (
                <div className="mt-16 center">
                  <Loading />
                </div>
              ) : (
                <>
                  {promptAnswer === "" ? (
                    ""
                  ) : (
                    <>
                      <p className="mt-16 prompt-answer">{promptAnswer}</p>
                    </>
                  )}
                  <>
                    {/* <button onClick={test}>Test</button> */}
                    <button className="w-full " onClick={getData}>
                      Summarise
                    </button>
                  </>
                </>
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
}

export default App;
