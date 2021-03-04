import React from "react";

import Button from "../Button";
import { Data } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import AddIcon from "../../images/baseline_add_black_24dp_x2.png";
import DeleteIcon from "../../images/baseline_delete_black_24dp.png";
import EditIcon from "../../images/baseline_edit_black_24dp.png";

interface Props {
  title: string;
  data: Data[];
  onDeleteClick?: (index: number) => void;
  onCreateClick?: () => void;
  onRenameClick?: (index: number) => void;
  onChange?: (index: number, value: string) => void;
  onBlur?: (index: number) => void;
}

export default class StatisticTable extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.handleCreateClick = this.handleCreateClick.bind(this);
  }

  private handleDeleteClick(index: number) {
    const { onDeleteClick } = this.props;

    if (onDeleteClick !== undefined) onDeleteClick(index);
  }

  private handleCreateClick() {
    const { onCreateClick } = this.props;

    if (onCreateClick !== undefined) onCreateClick();
  }

  private handleRenameClick(index: number) {
    const { onRenameClick } = this.props;

    if (onRenameClick !== undefined) onRenameClick(index);
  }

  private handleChange(index: number, value: string) {
    const { onChange } = this.props;

    if (onChange !== undefined) onChange(index, value);
  }

  private handleBlur(index: number) {
    const { onBlur } = this.props;

    if (onBlur !== undefined) onBlur(index);
  }

  render() {
    const { title, data } = this.props;
    return (
      <div>
        <h4>{title}</h4>
        {data.map((datum, index) => (
          <div className="ParticipantRow__extended-display__statistics-controls">
            <Button
              className="button button--small button--tertiary--light"
              onClick={() => this.handleDeleteClick(index)}
            >
              <img src={DeleteIcon} alt={`delete: ${datum.title}`} />
            </Button>
            <Button
              className="button button--small button--tertiary--light"
              onClick={() => this.handleRenameClick(index)}
            >
              <img src={EditIcon} alt={`rename: ${datum.title}`} />
            </Button>
            {DisplayFactory.createStatisticDisplay(
              "StatisticDisplay--horizontal",
              datum,
              (value) => this.handleChange(index, value),
              () => this.handleBlur(index)
            )}
          </div>
        ))}
        <Button
          className="button button--small button--primary"
          onClick={this.handleCreateClick}
        >
          <img src={AddIcon} alt="create statistic" />
        </Button>
      </div>
    );
  }
}
