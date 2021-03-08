import React, { ReactNode } from "react";

import "./Button.css";

interface Props {
  type?: "button" | "submit";
  onClick?(evt: React.MouseEvent<HTMLElement>): void;
  className?: string;
  children?: ReactNode;
}

function Button({ type, onClick, className, children }: Props) {
  return (
    <button
      type={type === "submit" ? "submit" : "button"}
      onClick={onClick}
      className={className}
    >
      <span data-testid="overlay" className="button__overlay" />
      {children}
    </button>
  );
}

Button.defaultProps = {
  type: "button",
  onClick: () => {
    // do nothing
  },
  className: "button",
  children: null,
};

export default Button;
