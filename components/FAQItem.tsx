import React, { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div className="faq-item">
      <p onClick={toggleAnswer} style={{ cursor: "pointer" }}>
      {question}
      </p>
      {showAnswer && <p>{answer}</p>}
    </div>
  );
};
