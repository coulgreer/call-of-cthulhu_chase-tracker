import * as React from "react";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";

import { WrappedStatistic } from "../StatisticDisplay";
import DisplayFactory from "../StatisticDisplay/DisplayFactory";
import { createMuiFormModal } from "../Modal";

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
      <Card variant="outlined">
        <CardHeader title={title} component="h2" />
        <CardContent>
          <Grid container>
            {data.map((datum, index) => {
              const { statistic } = datum;

              return (
                <Grid container item alignItems="center" key={datum.key}>
                  <Grid item xs={3}>
                    <IconButton
                      color="secondary"
                      aria-label={`delete: ${statistic.name}`}
                      onClick={() => this.handleDeleteClick(index)}
                    >
                      <span className="material-icons" aria-hidden>
                        delete_outline
                      </span>
                    </IconButton>
                  </Grid>
                  <Grid item xs={3}>
                    <IconButton
                      color="secondary"
                      aria-label={`rename: ${statistic.name}`}
                      onClick={() => this.handlePromptRenameClick(index)}
                    >
                      <span className="material-icons-outlined" aria-hidden>
                        edit
                      </span>
                    </IconButton>
                  </Grid>
                  <Grid item xs={6} zeroMinWidth>
                    {DisplayFactory.createStatisticDisplay(
                      datum,
                      (value) => this.handleStatisticValueChange(index, value),
                      () => this.handleStatisticValueBlur(index)
                    )}
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            color="secondary"
            size="large"
            variant="contained"
            fullWidth
            aria-label="create statistic"
            onClick={this.handleCreateClick}
          >
            <span className="material-icons" aria-hidden>
              add
            </span>
          </Button>
        </CardActions>
      </Card>
    );
  }

  private renderModal() {
    const { modalShown, currentNewName } = this.state;
    const nameId = "new-statistic-name";
    const Content = (
      <form onSubmit={this.handleSubmit}>
        <DialogContent>
          <TextField
            id={nameId}
            color="secondary"
            label="New Name"
            fullWidth
            value={currentNewName}
            onChange={this.handleStatisticNameChange}
            onBlur={this.handleStatisticNameBlur}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.closeModal}
          >
            CANCEL
          </Button>
          <Button color="secondary" type="submit">
            RENAME
          </Button>
        </DialogActions>
      </form>
    );

    return (
      modalShown &&
      createMuiFormModal(
        modalShown,
        "Rename statistic",
        Content,
        this.closeModal
      )
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
