import React from "react";

import Modal from "react-modal";

import Button from "../Button";
import { Data } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import AddIcon from "../../images/baseline_add_black_24dp_x2.png";
import DeleteIcon from "../../images/baseline_delete_black_24dp.png";
import EditIcon from "../../images/baseline_edit_black_24dp.png";

import "./StatisticTable.css";

interface Props {
  title: string;
  data: Data[];
  onDeleteClick?: (index: number) => void;
  onCreateClick?: () => void;
  onRenameStatistic?: (index: number, value: string) => void;
  onStatisticValueChange?: (index: number, value: string) => void;
  onStatisticValueBlur?: (index: number) => void;
}

interface State {
  modalShown: boolean;
  validNewName: string;
  currentNewName: string;
  selectedIndex: number;
}

export default class StatisticTable extends React.Component<Props, State> {
  static defaultNewName = "New Name";

  constructor(props: Props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);

    this.handleCreateClick = this.handleCreateClick.bind(this);
    this.handleStatisticNameChange = this.handleStatisticNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      modalShown: false,
      validNewName: StatisticTable.defaultNewName,
      currentNewName: StatisticTable.defaultNewName,
      selectedIndex: -1,
    };
  }

  private handleDeleteClick(index: number) {
    const { onDeleteClick } = this.props;

    if (onDeleteClick) onDeleteClick(index);
  }

  private handleCreateClick() {
    const { onCreateClick } = this.props;

    if (onCreateClick) onCreateClick();
  }

  private handlePromptRenameClick(index: number) {
    const { data } = this.props;

    this.setState({
      modalShown: true,
      selectedIndex: index,
      currentNewName: data[index].title,
      validNewName: data[index].title,
    });
  }

  private handleSubmit() {
    const { onRenameStatistic } = this.props;
    const { selectedIndex, validNewName } = this.state;

    if (onRenameStatistic) onRenameStatistic(selectedIndex, validNewName);
    this.setState({ modalShown: false, selectedIndex: -1 });
  }

  private handleStatisticValueChange(index: number, value: string) {
    const { onStatisticValueChange } = this.props;

    if (onStatisticValueChange) onStatisticValueChange(index, value);
  }

  private handleStatisticValueBlur(index: number) {
    const { onStatisticValueBlur } = this.props;

    if (onStatisticValueBlur) onStatisticValueBlur(index);
  }

  private handleStatisticNameChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const { value } = evt.target;

    if (value) this.setState({ validNewName: value });
    this.setState({ currentNewName: value });
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private renderContent() {
    const { title, data } = this.props;

    return (
      <>
        <h4>{title}</h4>
        {data.map((datum, index) => (
          <div className="StatisticTable__statistics-controls">
            <Button
              className="button button--small button--tertiary--light"
              onClick={() => this.handleDeleteClick(index)}
            >
              <img src={DeleteIcon} alt={`delete: ${datum.title}`} />
            </Button>
            <Button
              className="button button--small button--tertiary--light"
              onClick={() => this.handlePromptRenameClick(index)}
            >
              <img src={EditIcon} alt={`rename: ${datum.title}`} />
            </Button>
            {DisplayFactory.createStatisticDisplay(
              "StatisticDisplay--horizontal",
              datum,
              (value) => this.handleStatisticValueChange(index, value),
              () => this.handleStatisticValueBlur(index)
            )}
          </div>
        ))}
        <Button
          className="button button--small button--primary"
          onClick={this.handleCreateClick}
        >
          <img src={AddIcon} alt="create statistic" />
        </Button>
      </>
    );
  }

  private renderModal() {
    const { modalShown, currentNewName } = this.state;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Rename the Statistic"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <p className="Modal__Content__text">Rename the Statistic</p>
        <form onSubmit={this.handleSubmit}>
          <label className="input__label">
            New name
            <input
              className="input"
              type="text"
              value={currentNewName}
              onChange={this.handleStatisticNameChange}
              required
            />
          </label>
          <div className="Modal__Content__options">
            <Button
              className="button button--tertiary button--medium"
              onClick={this.closeModal}
            >
              CANCEL
            </Button>
            <Button
              className="button button--secondary button--medium"
              type="submit"
            >
              RENAME
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  render() {
    return (
      <div className="StatisticTable">
        {this.renderContent()}
        {this.renderModal()}
      </div>
    );
  }
}
