import React, { ReactNode } from "react";

import "./Button.css";

interface Props {
  onClick?(evt: React.MouseEvent<HTMLElement>): void;
  className?: string;
  children?: ReactNode;
}

function Button({ onClick, className, children }: Props) {
  return (
    <button type="button" onClick={onClick} className={className}>
      <span data-testid="overlay" className="button-overlay" />
      {children}
    </button>
  );
}

Button.defaultProps = {
  onClick: () => {},
  className: "button",
  children: null,
};

export default Button;
