/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import "./App.css";
import { PromptMaster } from "../../utils/PromptMaster";
import { useChromeStorage } from "../../components/useChromeStorage";
import ApiKeyModal from "../../components/ApiKeyModal";
import { Loading } from "../../components/Loading";
import { NewLineToBreak } from "../../components/NewLineToBreak";
import { FAQItem } from "../../components/FAQItem";
import { useState } from "react";

const ENGINE = "gpt-3.5-turbo";

function App() {
  const [storageValue, setStorageValue, getAllStorage] =
    useChromeStorage("docuquest-api");

  const [loading, setLoading] = useState(false);
  const [promptAnswer, setPromptAnswer] = useState({
    ctx: "",
    data: null,
  });

  // it appends "the following text:" to the end of the context
  const contextMap = new Map([
    [
      "SUMMARIZE",
      {
        id: "SUMMARIZE",
        ctx: "Summarize",
        parser: (text: string) => text,
      },
    ],
    [
      "FAQ",
      {
        id: "FAQ",
        ctx: "Create 5 HARD questions and answers, each question must prepend with 'Q' and answer prepend with 'A', for",
        parser: parseFAQText,
      },
    ],
  ]);

  const [contextList, setContextList] = useState<Map<string, any>>(contextMap);

  function parseFAQText(text: string) {
    const regex =
      /(Q\d+[:.])([\s\S]+?)(A\d+[:.])([\s\S]+?)(?=(?:Q\d+[:.])|$)/gm;
    const matches = text.matchAll(regex);
    const faqData = [];

    for (const match of matches) {
      let question = match[1] + " " + match[2].trim();
      let answer = match[4].trim();

      faqData.push({ question, answer });
    }

    console.log("YY faqData:", faqData);

    return faqData;
  }

  const handleGetAllStorage = async () => {
    const items = await getAllStorage();
    console.log("items:", items);
    return items;
  };

  const getData = async () => {
    // -- validate api key
    const storageItems = await handleGetAllStorage();

    const openaiKey = storageItems["docuquest-api"] as string;

    if (!openaiKey || typeof openaiKey !== "string") {
      const msg = "No openaiKey key found";
      alert(msg);
      console.error(msg);
      return;
    }

    // -- get context
    const ctxName = "FAQ";
    const selectedCtx = contextList.get(ctxName);

    const body = document.querySelector("body");

    const promptMaster = new PromptMaster({
      input: body!.innerText,
      apiKey: openaiKey,
      engine: ENGINE,
    });

    console.log("BODY:", body!.innerText);

    setLoading(true);
    let data;

    try {
      data = await promptMaster.context(
        `${selectedCtx.ctx} the following text:"`
      );

      console.log("Xdata:", data);

      const parsedData = selectedCtx.parser(data);

      console.log("parsedData:", parsedData);

      if (parsedData.length === 0) {
        setPromptAnswer({
          ctx: "SUMMARIZE",
          data: data as any,
        });
      } else {
        setPromptAnswer({
          ctx: ctxName,
          data: parsedData,
        });
      }

      setLoading(false);
    } catch (e) {
      console.log("error:", e);
    }
    setLoading(false);
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
                  {promptAnswer.ctx === "FAQ" && (
                    <>
                      {promptAnswer.data && (
                        <div className="mt-16 prompt-answer">
                          {/* {JSON.stringify(parseFAQText(promptAnswer))} */}
                          {/* <NewLineToBreak text={promptAnswer} /> */}
                          {(promptAnswer.data as any).map(
                            (item: any, index: number) => (
                              <FAQItem
                                key={index}
                                question={item.question}
                                answer={item.answer}
                              />
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {promptAnswer.ctx === "SUMMARIZE" && (
                    <>
                      {promptAnswer.data && (
                        <p className="mt-16 prompt-answer">
                          <NewLineToBreak text={promptAnswer.data} />
                        </p>
                      )}
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
