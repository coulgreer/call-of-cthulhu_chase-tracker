import React from "react";

import "./Button.css";

interface Props {
  onClick?(evt: React.MouseEvent<HTMLElement>): void;
  className?: string;
}

export default class Button extends React.Component<Props> {
  static defaultProps = {
    className: "button",
  };

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <button onClick={this.props.onClick} className={this.props.className}>
        <span data-testid="overlay" className="button-overlay"></span>
        {this.props.children}
      </button>
    );
  }
}
