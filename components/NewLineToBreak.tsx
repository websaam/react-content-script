import React, { useState } from "react";

interface NewLineToBreakProps {
  text: string;
}

export const NewLineToBreak: React.FC<NewLineToBreakProps> = ({ text }) => {
  const lines = text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return <React.Fragment>{lines}</React.Fragment>;
};
