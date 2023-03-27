import { useState } from "react";

function useModal() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => {
    setIsVisible(!isVisible);
  };

  return {
    isVisible,
    toggle,
  };
}

export default useModal;
