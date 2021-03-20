import React from "react";
import Button from "../Button";

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

  render() {
    const { displays } = this.props;
    const { displayedIndex } = this.state;

    return (
      <div className="TabbedDisplay">
        <div className="TabbedDisplay__tabs">
          {displays.map((display, index) => (
            <Button onClick={() => this.handleClick(index)}>
              {display.title}
            </Button>
          ))}
        </div>
        <div className="TabbeedDisplay__displays">
          {displays.map((display, index) => {
            return index === displayedIndex && <div>{display.content}</div>;
          })}
        </div>
      </div>
    );
  }
}
