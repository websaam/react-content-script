import React from "react";

export const Loading = () => {
  return (
    <>
      <svg
        width="18"
        height="18"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="#FFA500"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="80, 150"
          strokeDashoffset="0"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </>
  );
};
