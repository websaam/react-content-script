/// <reference types="chrome" />
/// <reference types="vite-plugin-svgr/client" />

import "./App.css";
import { PromptMaster } from "../../utils/PromptMaster";
import { log } from "../../utils/log";
import { useChromeStorage } from "../../components/useChromeStorage";
import ApiKeyModal from "../../components/ApiKeyModal";
import { Loading } from "../../components/Loading";
import { NewLineToBreak } from "../../components/NewLineToBreak";
import { FAQItem } from "../../components/FAQItem";
import { useElementSelector } from "../../components/useElementSelector";
import { Logo } from "../../components/Logo";

import { useEffect, useRef, useState } from "react";

const ENGINE = "gpt-3.5-turbo";

// --- Delayed State Hook ---
type SetStateAction<S> = S | ((prevState: S) => S);

type DispatchWithDelay<S> = (action: SetStateAction<S>, delay: number) => void;

const useDelayedState = <S,>(
  initialState: S | (() => S)
): [S, DispatchWithDelay<S>] => {
  const [state, setState] = useState(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setDelayedState: DispatchWithDelay<S> = (action, delay) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(action);
      timeoutRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, setDelayedState];
};

function App() {
  const [storageValue, setStorageValue, getAllStorage] =
    useChromeStorage<String>("docuquest-api");

  const [enabled, setEnabled] = useChromeStorage<Boolean>(
    "docuquest-inspect-element"
  );

  const [showModal, setShowModal] = useChromeStorage<Boolean>(
    "docuquest-show-modal"
  );

  const [showModalDelayed, setShowModalDelayed] = useDelayedState<Boolean>(
    showModal ? true : false
  );

  const { selectedElement, selectedInnerText, resetElementSelector } =
    useElementSelector(
      enabled ? true : false,
      {
        except: [".app-docuquest"],
      },
      (element: HTMLElement) => {
        log("(callback) element:", element);
        getData(element.innerText);
        setEnabled(false);
      },
      (enable) => {
        setEnabled(enable);
        resetElementSelector();
      },
      // close modal
      () => {
        setShowModal(false);
        setShowModalDelayed(false, 0);
      },
      // open modal
      () => {
        setShowModal(true);
        setShowModalDelayed(true, 0);
      }
    );

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(event.target.checked);
  };

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

    log("YY faqData:", faqData);

    return faqData;
  }

  const handleGetAllStorage = async () => {
    const items = await getAllStorage();
    log("items:", items);
    return items;
  };

  const getData = async (promptText?: string) => {
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

    if (!promptText) {
      const body = document.querySelector("body");
      promptText = body!.innerText;
    }

    const promptMaster = new PromptMaster({
      input: promptText,
      apiKey: openaiKey,
      engine: ENGINE,
    });

    log("promptText:", promptText);

    setLoading(true);
    let data;

    try {
      data = await promptMaster.context(
        `${selectedCtx.ctx} the following text:"`
      );

      log("Xdata:", data);

      const parsedData = selectedCtx.parser(data);

      log("parsedData:", parsedData);

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
      log("error:", e);
    }
    setLoading(false);
  };

  function getShortcut(what: string) {
    const shortcuts = [
      {
        platform: "Mac",
        action: "TO_ENABLE",
        shortcut: `⌘⇧S`,
        description: "(⌘⇧S) Highlight",
      },
      {
        platform: "Win",
        action: "TO_ENABLE",
        shortcut: "Ctrl+Shift+S",
        description: "(Ctrl+Shift+S) Highlight",
      },
      {
        action: "TO_DISABLE",
        shortcut: "(esc)",
        description: "(esc) Remove Highlight",
      },
    ];

    const matchingShortcut = shortcuts.find(
      (s) =>
        s.action === what &&
        (!s.platform || navigator.platform.indexOf(s.platform) !== -1)
    );

    return matchingShortcut ? matchingShortcut.description : "";
  }

  const handleLogoClick = async () => {
    log("handleLogoClick");
    document.getElementById("app-docuquest")!.classList.toggle("active");
    setShowModal(!showModal);

    if (!showModal === true) {
      setShowModalDelayed(true, 0);
    } else {
      setShowModalDelayed(false, 0);
    }
  };

  return (
    <div
      id="app-docuquest"
      className={`app-docuquest ${showModal ? "active" : ""}`}
    >
      <div className="flex docu-head">
        <Logo handleClick={handleLogoClick} />
        <h1>DocuQuest</h1>
      </div>

      <div className={`docu-body ${showModalDelayed ? "active" : ""}`}>
        {showModalDelayed && (
          <div className="docu-opts">
            <label>
              <input
                type="checkbox"
                checked={enabled ? true : false}
                onChange={handleCheckboxChange}
              />
              <span> {getShortcut(enabled ? "TO_DISABLE" : "TO_ENABLE")}</span>
            </label>
          </div>
        )}
        <div className="flex">
          <ApiKeyModal
            keyName={"docuquest-api"}
            setKey={setStorageValue}
            keyValue={storageValue}
          />

          {storageValue && showModalDelayed && (
            <>
              {loading ? (
                <div className="mt-16 center">
                  <Loading />
                </div>
              ) : (
                <div id="docu-body">
                  {promptAnswer.ctx === "FAQ" && (
                    <>
                      {promptAnswer.data && (
                        <div className="mt-16 prompt-answer">
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
                  <button className="w-full " onClick={() => getData()}>
                    {enabled ? "Docufy Selected!" : "Docufy Page!"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
