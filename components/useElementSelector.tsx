import { useState, useEffect } from "react";
import { log } from "../utils/log";
export type UseElementSelectorOpts = {
  except: string[];
};

export const useElementSelector = (
  enabled: boolean,
  opts: UseElementSelectorOpts,
  onClick?: (element: HTMLElement) => void,
  onHighlight?: (enable: boolean) => void,
  onCloseModal?: () => void,
  onOpenModal?: () => void
) => {
  const [selectedElement, setSelectedElement] = useState<{
    id: string;
    className: string;
  } | null>(null);

  const [selectedInnerText, setSelectedInnerText] = useState<string | null>(
    null
  );

  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(
    null
  );

  function isIgnoreElements(target: HTMLElement) {
    if (opts.except.length > 0) {
      for (let exceptElement of opts.except) {
        const foundElement = target.closest(exceptElement);

        if (foundElement) {
          log(
            `Prevented because this element is in the except list ${opts.except}`
          );
          return true;
        }
      }
    }
    return false;
  }

  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;

      if (isIgnoreElements(target)) return;

      setHoveredElement(target);
      // target.style.outline = "2px solid red";
      target.classList.add("docuquest-highlight");
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!enabled || !hoveredElement) return;

      // remove "docuquest-highlight" from classList
      hoveredElement.classList.remove("docuquest-highlight");

      setHoveredElement(null);
    };

    function handleCtrlShiftS(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 83) {
        e.preventDefault(); // prevent default behavior (e.g. save)
        // add your code here to handle the Ctrl+Shift+S key press
        log("Ctrl + Shift + S pressed");
        // handleClick(e as any);
        if (onHighlight) {
          onHighlight(true);
        }

        if (!enabled) {
          document.getElementById("app-docuquest")!.classList.add("active");
          if (onOpenModal) {
            onOpenModal();
          }
        }
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.keyCode === 27) {
        e.preventDefault(); // prevent default behavior (e.g. close modal)
        // add your code here to handle the Esc key press
        log("Esc pressed");

        if (onHighlight) {
          onHighlight(false);
        }

        // if it's not highlighted
        if (!enabled) {
          // look for #app-docuquest and remove 'active' class
          document.getElementById("app-docuquest")!.classList.remove("active");
          if (onCloseModal) {
            onCloseModal();
          }
        }
      }
    }

    const handleClick = (event: MouseEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;

      if (isIgnoreElements(target)) return;

      if (target) {
        log("Clicked on element", target);
        setSelectedElement({
          id: target.id,
          className: target.className,
        });
        setSelectedInnerText(target.innerText);

        if (onClick) {
          onClick(target);
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("keydown", handleCtrlShiftS);
    document.addEventListener("keydown", handleEsc);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("keydown", handleCtrlShiftS);
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("click", handleClick);
    };
  }, [enabled, hoveredElement]);

  const resetElementSelector = () => {
    const hoverElements = document.querySelectorAll(".docuquest-highlight");

    for (let hoverElement of hoverElements) {
      hoverElement.classList.remove("docuquest-highlight");
    }

    setSelectedElement(null);
    setSelectedInnerText(null);
  };
  return { selectedElement, selectedInnerText, resetElementSelector };
};
