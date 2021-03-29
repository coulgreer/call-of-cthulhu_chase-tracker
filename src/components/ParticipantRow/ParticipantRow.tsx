import React from "react";
import { Transition, animated } from "react-spring/renderprops";
import Modal from "react-modal";

import Button from "../Button";
import StatisticTable from "../StatisticTable";
import { Data as StatisticDisplayData } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";

import ExpandLessIcon from "../../images/baseline_expand_less_black_24dp.png";
import ExpandMoreIcon from "../../images/baseline_expand_more_black_24dp.png";

import "./ParticipantRow.css";
import UniqueSequenceGenerator from "../../utils/unique-sequence-generator";
import { roll, Result } from "../../utils/roller";

interface Props {
  defaultParticipantName: string;
}

interface State {
  currentName: string;
  validName: string;
  nameWarningShown: boolean;
  expansionShown: boolean;
  modalShown: boolean;
  mainStatistics: StatisticDisplayData[];
  speedStatistics: StatisticDisplayData[];
  hazardStatistics: StatisticDisplayData[];
  selectedStatValue: string;
}

const SEQUENCE_START = 0;

export default class ParticipantRow extends React.Component<Props, State> {
  static get DEX_TITLE() {
    return "DEX";
  }

  static get SPEED_TITLE() {
    return "Speed";
  }

  static get MOV_TITLE() {
    return "MOV";
  }

  static get CON_TITLE() {
    return "CON";
  }

  static get DRIVE_TITLE() {
    return "Drive Auto";
  }

  static get RIDE_TITLE() {
    return "Ride";
  }

  static get AIR_TITLE() {
    return "Pilot (Aircraft)";
  }

  static get SEA_TITLE() {
    return "Pilot (Boat)";
  }

  static get STR_TITLE() {
    return "STR";
  }

  static get CLIMB_TITLE() {
    return "Climb";
  }

  static get SWIM_TITLE() {
    return "Swim";
  }

  static get DODGE_TITLE() {
    return "Dodge";
  }

  static get BRAWL_TITLE() {
    return "Fighting (Brawl)";
  }

  static get HANDGUN_TITLE() {
    return "Firearms (Handgun)";
  }

  static get RIFLE_TITLE() {
    return "Firearms (Rifle)";
  }

  static get WARNING_MESSAGE() {
    return "Even Elder Ones have a title. You ought follow suit.";
  }

  static get DEFAULT_STAT_NAME() {
    return "New Stat";
  }

  static generateSpeedModifier(value: number) {
    const degreeOfSuccess = roll(value);

    switch (degreeOfSuccess) {
      case Result.CriticalSuccess:
      case Result.ExtremeSuccess:
        return 1;
      case Result.HardSuccess:
      case Result.RegularSuccess:
        return 0;
      case Result.Failure:
      case Result.Fumble:
        return -1;
      default:
        throw new Error(
          `The degree of success, ${degreeOfSuccess}, was unexpected.`
        );
    }
  }

  /* eslint-disable no-param-reassign */
  static manageValue(value: string, data: StatisticDisplayData) {
    const {
      upperLimit = Number.MAX_SAFE_INTEGER,
      lowerLimit = Number.MIN_SAFE_INTEGER,
    } = data;

    if (value !== "") {
      const valueNum = Number.parseInt(value, 10);
      if (valueNum > upperLimit) {
        data.validValue = upperLimit;
      } else if (valueNum < lowerLimit) {
        data.validValue = lowerLimit;
      } else {
        data.validValue = valueNum;
      }
    }
    data.currentValue = value;
  }

  private speedStatSequence: UniqueSequenceGenerator;

  private hazardStatSequence: UniqueSequenceGenerator;

  private speedStatisticEl: StatisticDisplayData;

  constructor(props: Props) {
    super(props);

    this.speedStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);
    this.hazardStatSequence = new UniqueSequenceGenerator(SEQUENCE_START);
    this.speedStatisticEl = { title: "", currentValue: "0", validValue: 0 };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);

    this.toggleExpansion = this.toggleExpansion.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    // Speed Statistic method binds
    this.createSpeedStatistic = this.createSpeedStatistic.bind(this);
    this.deleteSpeedStatistic = this.deleteSpeedStatistic.bind(this);
    this.renameSpeedStatistic = this.renameSpeedStatistic.bind(this);
    this.handleSpeedStatisticChange = this.handleSpeedStatisticChange.bind(
      this
    );
    this.handleSpeedStatisticBlur = this.handleSpeedStatisticBlur.bind(this);

    // Hazard Statistic method binds
    this.createHazardStatistic = this.createHazardStatistic.bind(this);
    this.deleteHazardStatistic = this.deleteHazardStatistic.bind(this);
    this.renameHazardStatistic = this.renameHazardStatistic.bind(this);
    this.handleHazardStatisticChange = this.handleHazardStatisticChange.bind(
      this
    );
    this.handleHazardStatisticBlur = this.handleHazardStatisticBlur.bind(this);

    this.calculateSpeedModifier = this.calculateSpeedModifier.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    const { defaultParticipantName } = this.props;

    this.state = {
      currentName: defaultParticipantName,
      validName: defaultParticipantName,
      nameWarningShown: false,
      expansionShown: false,
      mainStatistics: this.initializeMainStatistics(),
      speedStatistics: this.initializeSpeedStatistics(),
      hazardStatistics: this.initializeHazardStatistics(),
      selectedStatValue: "",
      modalShown: false,
    };
  }

  private handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    if (value.trim()) {
      this.setState(() => ({
        validName: value,
        nameWarningShown: false,
      }));
    } else {
      this.setState(() => ({ nameWarningShown: true }));
    }

    this.setState(() => ({ currentName: value }));
  }

  private handleNameBlur() {
    this.setState((state) => ({
      currentName: state.validName,
      nameWarningShown: false,
    }));
  }

  private handleMainStatisticChange(index: number, value: string) {
    const { mainStatistics } = this.state;
    const data = mainStatistics[index];

    ParticipantRow.manageValue(value, data);

    mainStatistics[index] = data;
    this.setState({ mainStatistics });
  }

  private handleSpeedStatisticChange(index: number, value: string) {
    const { speedStatistics } = this.state;
    const data = speedStatistics[index];

    ParticipantRow.manageValue(value, data);

    speedStatistics[index] = data;
    this.setState({ speedStatistics });
  }

  private handleHazardStatisticChange(index: number, value: string) {
    const { hazardStatistics } = this.state;
    const data = hazardStatistics[index];

    ParticipantRow.manageValue(value, data);

    hazardStatistics[index] = data;
    this.setState({ hazardStatistics });
  }

  private handleMainStatisticBlur(index: number) {
    const { mainStatistics } = this.state;
    const data = mainStatistics[index];
    const { validValue } = data;

    data.currentValue = validValue.toString();
    mainStatistics[index] = data;

    this.setState({ mainStatistics });
  }

  private handleSpeedStatisticBlur(index: number) {
    const { speedStatistics } = this.state;
    const data = speedStatistics[index];
    const { validValue } = data;

    data.currentValue = validValue.toString();
    speedStatistics[index] = data;

    this.setState({ speedStatistics });
  }

  private handleHazardStatisticBlur(index: number) {
    const { hazardStatistics } = this.state;
    const data = hazardStatistics[index];
    const { validValue } = data;

    data.currentValue = validValue.toString();
    hazardStatistics[index] = data;

    this.setState({ hazardStatistics });
  }

  private handleSelectionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    this.setState({ selectedStatValue: value });
  }

  private initializeMainStatistics() {
    const stats = [
      {
        title: ParticipantRow.DEX_TITLE,
        currentValue: "15",
        validValue: 15,
        key: 1,
      },
      {
        title: ParticipantRow.SPEED_TITLE,
        currentValue: "0",
        validValue: 0,
        key: 2,
      },
      {
        title: ParticipantRow.MOV_TITLE,
        currentValue: "2",
        validValue: 2,
        lowerWarning: 1,
        upperWarning: 10,
        key: 3,
      },
    ];

    [this.speedStatisticEl] = stats.filter(
      (stat) => stat.title === ParticipantRow.SPEED_TITLE
    );

    return stats;
  }

  private initializeSpeedStatistics() {
    return [
      {
        title: ParticipantRow.CON_TITLE,
        currentValue: "15",
        validValue: 15,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.DRIVE_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.RIDE_TITLE,
        currentValue: "5",
        validValue: 5,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.AIR_TITLE,
        currentValue: "1",
        validValue: 1,
        key: this.speedStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.SEA_TITLE,
        currentValue: "1",
        validValue: 1,
        key: this.speedStatSequence.nextNum(),
      },
    ];
  }

  private initializeHazardStatistics() {
    return [
      {
        title: ParticipantRow.STR_TITLE,
        currentValue: "15",
        validValue: 15,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.CLIMB_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.SWIM_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.DODGE_TITLE,
        currentValue: "7",
        validValue: 7,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.BRAWL_TITLE,
        currentValue: "25",
        validValue: 25,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.HANDGUN_TITLE,
        currentValue: "20",
        validValue: 20,
        key: this.hazardStatSequence.nextNum(),
      },
      {
        title: ParticipantRow.RIFLE_TITLE,
        currentValue: "25",
        validValue: 25,
        key: this.hazardStatSequence.nextNum(),
      },
    ];
  }

  private calculateSpeedModifier() {
    const { selectedStatValue } = this.state;

    const modifier = ParticipantRow.generateSpeedModifier(
      Number.parseInt(selectedStatValue, 10)
    );
    this.updateSpeedModifierEl(modifier);
    this.closeModal();
  }

  private toggleExpansion() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private createSpeedStatistic() {
    const key = this.speedStatSequence.nextNum();
    const newData = {
      title: `${ParticipantRow.DEFAULT_STAT_NAME} #${key}`,
      currentValue: "15",
      validValue: 15,
      key,
    };

    this.setState((state) => ({
      speedStatistics: [...state.speedStatistics, newData],
    }));
  }

  private deleteSpeedStatistic(index: number) {
    const { speedStatistics } = this.state;
    const [removedData] = speedStatistics.splice(index, 1);

    this.speedStatSequence.remove(removedData.key);

    this.setState({ speedStatistics });
  }

  private renameSpeedStatistic(index: number, value: string) {
    const { speedStatistics } = this.state;
    const data = speedStatistics[index];

    data.title = value;
    speedStatistics[index] = data;

    this.setState({ speedStatistics });
  }

  private createHazardStatistic() {
    const key = this.hazardStatSequence.nextNum();
    const newData = {
      title: `${ParticipantRow.DEFAULT_STAT_NAME} #${key}`,
      currentValue: "15",
      validValue: 15,
      key,
    };

    this.setState((state) => ({
      hazardStatistics: [...state.hazardStatistics, newData],
    }));
  }

  private deleteHazardStatistic(index: number) {
    const { hazardStatistics } = this.state;
    const [removedData] = hazardStatistics.splice(index, 1);

    this.hazardStatSequence.remove(removedData.key);

    this.setState({ hazardStatistics });
  }

  private renameHazardStatistic(index: number, value: string) {
    const { hazardStatistics } = this.state;
    const data = hazardStatistics[index];

    data.title = value;
    hazardStatistics[index] = data;

    this.setState({ hazardStatistics });
  }

  private openModal() {
    this.setState({ modalShown: true });
  }

  private closeModal() {
    this.setState({ modalShown: false });
  }

  private updateSpeedModifierEl(modifier: number) {
    this.speedStatisticEl.currentValue = modifier.toString();
    this.speedStatisticEl.validValue = modifier;
  }

  /*
   * FIXME (Coul Greer): There is a known bug in ReactModal involving radio
   * buttons and pressing shift+tab. The focus escapes the modal when
   * shift-tabbing through modal elements causing a break in the very point of
   * using this package.
   */
  private renderSpeedStatisticModal() {
    const { modalShown, speedStatistics } = this.state;

    return (
      <Modal
        className="Modal__Content"
        overlayClassName="Modal__Overlay"
        contentLabel="Select Speed Statistic"
        isOpen={modalShown}
        onRequestClose={this.closeModal}
      >
        <p>Select a speed skill</p>
        <form onSubmit={this.calculateSpeedModifier}>
          {speedStatistics.map((data) => (
            <label className="input__radio input__label" key={data.key}>
              <input
                className="input__radio__checkbox"
                type="radio"
                name="selectedStatistic"
                value={data.validValue}
                onChange={this.handleSelectionChange}
              />
              <span className="input__radio__checkmark" />
              {data.title}
            </label>
          ))}
          <div className="Modal__Content__options">
            <Button
              className="button button--secondary button--small"
              onClick={this.closeModal}
            >
              CANCEL
            </Button>
            <Button
              className="button button--primary button--small"
              type="submit"
            >
              CONFIRM
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  private renderMainDisplay() {
    const {
      expansionShown,
      nameWarningShown,
      currentName,
      mainStatistics,
    } = this.state;

    return (
      <div className="ParticipantRow__main-display">
        <label className="input input__label">
          Name
          <input
            className="input__textbox input__textbox--full-width"
            type="text"
            value={currentName}
            onChange={this.handleNameChange}
            onBlur={this.handleNameBlur}
          />
        </label>
        <p
          className="error"
          style={{
            visibility: nameWarningShown ? "visible" : "hidden",
          }}
        >
          {ParticipantRow.WARNING_MESSAGE}
        </p>
        <div className="ParticipantRow__footer">
          <div className="ParticipantRow__main-characteristics">
            {mainStatistics.map((data, index) =>
              DisplayFactory.createStatisticDisplay(
                "StatisticDisplay--vertical",
                data,
                (value) => this.handleMainStatisticChange(index, value),
                () => this.handleMainStatisticBlur(index)
              )
            )}
            <Button
              className="button button--secondary button--small"
              onClick={this.openModal}
            >
              GENERATE
            </Button>
          </div>
          <Button
            className="button button--primary button--small button--circular"
            onClick={this.toggleExpansion}
          >
            {expansionShown ? (
              <img src={ExpandLessIcon} alt="Collapse" />
            ) : (
              <img src={ExpandMoreIcon} alt="Expand" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  private renderExpansiveDisplay() {
    const { expansionShown } = this.state;
    return (
      <Transition
        native
        items={expansionShown}
        from={{ height: 0, overflow: "hidden" }}
        enter={{ height: "auto" }}
        leave={{ height: 0 }}
      >
        {(shown) =>
          shown &&
          ((props) => (
            <animated.div
              className="ParticipantRow__extended-display"
              style={props}
            >
              {this.renderSpeedStatistics()}
              {this.renderHazardStatistics()}
            </animated.div>
          ))
        }
      </Transition>
    );
  }

  private renderSpeedStatistics() {
    const { speedStatistics } = this.state;
    const title = "SPEED Stats";

    return (
      <StatisticTable
        title={title}
        data={speedStatistics}
        onCreateClick={this.createSpeedStatistic}
        onDeleteClick={this.deleteSpeedStatistic}
        onRenameStatistic={this.renameSpeedStatistic}
        onStatisticValueChange={this.handleSpeedStatisticChange}
        onStatisticValueBlur={this.handleSpeedStatisticBlur}
      />
    );
  }

  private renderHazardStatistics() {
    const { hazardStatistics } = this.state;
    const title = "HAZARD Stats";

    return (
      <StatisticTable
        title={title}
        data={hazardStatistics}
        onCreateClick={this.createHazardStatistic}
        onDeleteClick={this.deleteHazardStatistic}
        onRenameStatistic={this.renameHazardStatistic}
        onStatisticValueChange={this.handleHazardStatisticChange}
        onStatisticValueBlur={this.handleHazardStatisticBlur}
      />
    );
  }

  render() {
    return (
      <div className="ParticipantRow">
        {this.renderMainDisplay()}
        {this.renderExpansiveDisplay()}
        {this.renderSpeedStatisticModal()}
      </div>
    );
  }
}
