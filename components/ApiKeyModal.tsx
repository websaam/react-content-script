import { useRef } from "react";
import useModal from "./useModal";

function ApiKeyModal({
  keyName,
  setKey,
  keyValue,
}: {
  keyName: string;
  setKey?: any;
  keyValue?: any;
}) {
  const { isVisible, toggle } = useModal();
  const inputRef = useRef<any>(null);
  const modalContentRef = useRef<any>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const apiKey = inputRef.current.value;

    const url = "https://api.openai.com/v1/models";

    let res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const msg = await res.json();

    if (res.status !== 200) {
      alert(msg.error.message);
      setKey("");
      return;
    }

    setKey(apiKey);

    toggle();
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Escape") {
      toggle();
    }
  };

  const handleClickOutside = (e: any) => {
    if (!modalContentRef.current.contains(e.target)) {
      toggle();
    }
  };

  return (
    <>
      {!keyValue ? (
        <button className="w-full" onClick={toggle}>
          🔑 Set API Key
        </button>
      ) : (
        <button className="float-right-right" onClick={toggle}>
          ⚙️
        </button>
      )}

      {isVisible && (
        <div
          className="modal"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          onClick={handleClickOutside}
        >
          <div className="modal-content" ref={modalContentRef}>
            <h2>🔑 OpenAI API Key</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                ref={inputRef}
                defaultValue={keyValue ?? null}
                placeholder="API Key"
                autoFocus
              />
              <button id="btn-api-save" type="submit">
                💾 {!keyValue ? "Save" : "Update"}
              </button>
            </form>
            <button id="btn-api-close" onClick={toggle}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ApiKeyModal;
