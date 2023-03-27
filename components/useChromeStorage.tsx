import { useState, useEffect } from "react";

type UseChromeStorageResult<T> = [
  T | undefined,
  React.Dispatch<React.SetStateAction<T | undefined>>,
  () => Promise<Record<string, unknown>>
];

export const useChromeStorage = <T,>(
  key: string
): UseChromeStorageResult<T> => {
  const [storageValue, setStorageValue] = useState<T>();

  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      if (chrome.runtime.lastError) {
        console.log("Error reading Chrome storage:", chrome.runtime.lastError);
        return;
      }
      setStorageValue(result[key] as T);
    });
  }, [key]);

  useEffect(() => {
    chrome.storage.sync.set({ [key]: storageValue }, () => {
      if (chrome.runtime.lastError) {
        console.log(
          "Error writing to Chrome storage:",
          chrome.runtime.lastError
        );
      }
    });
  }, [key, storageValue]);

  const getAllStorage = () => {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      chrome.storage.sync.get(null, (items) => {
        if (chrome.runtime.lastError) {
          console.log(
            "Error reading all storage data:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else {
          resolve(items);
        }
      });
    });
  };

  return [storageValue, setStorageValue, getAllStorage];
};
