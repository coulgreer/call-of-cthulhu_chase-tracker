import React from "react";

import "./Button.css";

function Button({
  type = "button",
  className = "button",
  ...props
}: React.HTMLProps<HTMLButtonElement>) {
  return (
    <button
      type={type === "submit" ? "submit" : "button"}
      onClick={props.onClick}
      className={className}
      disabled={props.disabled}
      role={props.role}
      aria-label={props["aria-label"]}
      aria-expanded={props["aria-expanded"]}
      aria-controls={props["aria-controls"]}
    >
      <span data-testid="overlay" className="button__overlay" />
      {props.children}
    </button>
  );
}

export default Button;
