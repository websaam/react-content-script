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

function App() {
  const [storageValue, setStorageValue, getAllStorage] =
    useChromeStorage("docuquest-api");

  const [loading, setLoading] = useState(false);
  const [promptAnswer, setPromptAnswer] = useState("");
  const [faqData, setFaqData] = useState<any>(null);

  // it appends "the following text:" to the end of the context
  const [contextList, setContextList] = useState<string[]>([
    "Summarize",
    "Create 8 questions and answers, each question must prepend with 'Q' and answer prepend with 'A', for",
  ]);

  function parseFAQText(text: string) {
    const regex = /(Q\d+\..+?)(A\d+\..+?)(?=(?:Q\d+\.)|$)/gs;
    const matches = text.matchAll(regex);
    const faqData = [];

    for (const match of matches) {
      let question = match[1].trim();
      let answer = match[2].trim();

      // use regex to remove A1. A2. etc.
      answer = answer.replace(/A\d+\./, "").trim();
      faqData.push({ question, answer });
    }

    return faqData;
  }

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

    // setPromptAnswer();

    const parsedFaqData = parseFAQText(`Q1. What is Lit Protocol?
    A1. Lit Protocol is a programmable key-value based blockchain protocol that enables developers to build decentralized apps.
    
    Q2. What are the use cases of Lit Protocol?
    A2. The use cases for Lit Protocol include access control, programmable key pairs, and Lit Actions.
    
    Q3. What are Lit Actions?
    A3. Lit Actions are a feature of Lit Protocol that allow developers to write custom code that can be executed on the blockchain.
    
    Q4. How can Lit Actions interact with external APIs?
    A4. Lit Actions can use fetch requests to interact with external APIs.
    
    Q5. How does Lit Protocol handle consensus for fetch requests?
    A5. Lit Protocol sends the fetch request to all nodes in parallel, and consensus is based on at least 23 nodes getting the same response.
    
    Q6. How many times will a fetch request be sent on the Lit Network?
    A6. A fetch request will be sent N times, where N is the number of nodes in the Lit Network.
    
    Q7. What is idempotence, and why is it important when using fetch to write data?
    A7. Idempotence is the property of an operation where applying the same operation repeatedly does not modify the result. It is important when using fetch to write data because the request will be sent to the server multiple times.
    
    Q8. Where can I find an example project using Lit Actions?
    A8. An example project using Lit Actions can be found on the Lit Protocol Developer Docs page under Example Projects.`);

    setFaqData(parsedFaqData);
    return;
    // --- re-enable thos
    setLoading(true);
    let data;
    try {
      data = await promptMaster.context(
        `${contextList[1]} the following text:"`
      );

      const parsedFaqData = parseFAQText(data);
      console.log("parsedFaqData:", parsedFaqData);
      setFaqData(parsedFaqData);
      setPromptAnswer(data);
      // console.log("data:", data);
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
                  {faqData && (
                    <p className="mt-16 prompt-answer">
                      {/* {JSON.stringify(parseFAQText(promptAnswer))} */}
                      {/* <NewLineToBreak text={promptAnswer} /> */}
                      {faqData.map((item: any, index: number) => (
                        <FAQItem
                          key={index}
                          question={item.question}
                          answer={item.answer}
                        />
                      ))}
                    </p>
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
