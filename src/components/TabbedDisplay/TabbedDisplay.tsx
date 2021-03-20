import React from "react";

import Button from "../Button";

import "./TabbedDisplay.css";

interface Props {
  displays: Data[];
}

interface State {
  displayedIndex: number;
}

export interface Data {
  title: string;
  content: JSX.Element;
}

export default class TabbedDisplay extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { displayedIndex: 0 };
  }

  private handleClick(index: number) {
    this.setState({ displayedIndex: index });
  }

  private isActive(index: number) {
    const { displayedIndex } = this.state;

    return index === displayedIndex;
  }

  render() {
    const { displays } = this.props;

    return (
      <div className="TabbedDisplay">
        <div className="TabbedDisplay__tabs">
          {displays.map((display, index) => (
            <Button
              className={`button button--large TabbedDisplay__tab ${
                this.isActive(index)
                  ? "TabbedDisplay__tab--enabled"
                  : "TabbedDisplay__tab--disabled"
              }`}
              onClick={() => this.handleClick(index)}
            >
              {display.title}
            </Button>
          ))}
        </div>
        <div className="TabbedDisplay__displays">
          {displays.map((display, index) => {
            return this.isActive(index) && <div>{display.content}</div>;
          })}
        </div>
      </div>
    );
  }
}
