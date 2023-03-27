import { useEffect, useState } from "react";

export const Logo = ({ handleClick }: { handleClick?: () => void }) => {
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    // const _img = chrome.extension.getURL("./logo192.png");
    // get chrome extension id
    const logoUrl = chrome.runtime.getURL("logo192.png");

    // console.log(logoUrl);
    setImg(logoUrl);
  });

  return (
    <>
      <img onClick={handleClick} width="18" height="18" src={img!}></img>
    </>
  );
};
