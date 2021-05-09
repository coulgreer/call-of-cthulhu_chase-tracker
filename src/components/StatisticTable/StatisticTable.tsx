import React from "react";

import Modal from "react-modal";

import Button from "../Button";
import { WrappedStatistic } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import "./StatisticTable.css";

interface Props {
  title: string;
  data: WrappedStatistic[];
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
    this.handleStatisticNameBlur = this.handleStatisticNameBlur.bind(this);
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
    const { statistic } = data[index];

    this.setState({
      modalShown: true,
      selectedIndex: index,
      currentNewName: statistic.name,
      validNewName: statistic.name,
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

  private handleStatisticNameChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { value } = event.currentTarget;

    if (value.trim()) this.setState({ validNewName: value.trim() });

    this.setState({ currentNewName: value });
  }

  private handleStatisticNameBlur() {
    this.setState((state) => {
      const { currentNewName, validNewName } = state;

      if (currentNewName.trim()) return { currentNewName };

      return { currentNewName: validNewName };
    });
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private renderContent() {
    const { title, data } = this.props;

    return (
      <>
        <h2>{title}</h2>
        {data.map((datum, index) => {
          const { statistic } = datum;

          return (
            <div
              className="StatisticTable__statistics-controls"
              key={datum.key}
            >
              <Button
                className="button button--small button--tertiary-on-light"
                aria-label={`delete: ${statistic.name}`}
                onClick={() => this.handleDeleteClick(index)}
              >
                <span className="material-icons" aria-hidden>
                  delete_outline
                </span>
              </Button>
              <Button
                className="button button--small button--tertiary-on-light"
                aria-label={`rename: ${statistic.name}`}
                onClick={() => this.handlePromptRenameClick(index)}
              >
                <span className="material-icons-outlined" aria-hidden>
                  edit
                </span>
              </Button>
              {DisplayFactory.createStatisticDisplay(
                "StatisticDisplay--horizontal",
                datum,
                (value) => this.handleStatisticValueChange(index, value),
                () => this.handleStatisticValueBlur(index),
                "textbox--on-light"
              )}
            </div>
          );
        })}
        <Button
          className="button button--small button--primary"
          aria-label="create statistic"
          onClick={this.handleCreateClick}
        >
          <span className="material-icons" aria-hidden>
            add
          </span>
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
        <h2 className="Modal__Content__text">Rename the Statistic</h2>
        <hr />
        <form onSubmit={this.handleSubmit}>
          <label>
            <span className="input__label">New Name</span>
            <input
              className="textbox textbox--full-width"
              type="text"
              value={currentNewName}
              onChange={this.handleStatisticNameChange}
              onBlur={this.handleStatisticNameBlur}
              required
            />
          </label>
          <hr />
          <div className="Modal__Content__options">
            <Button
              className="button button--medium button--tertiary-on-dark"
              onClick={this.closeModal}
            >
              CANCEL
            </Button>
            <Button
              className="button button--medium button--secondary"
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
