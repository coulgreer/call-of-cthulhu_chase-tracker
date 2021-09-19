import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
  createStyles,
  DialogActions,
  DialogContent,
  DialogContentText,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  List,
  ListItem,
  NativeSelect,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { nanoid } from "nanoid";
import React from "react";
import { Group, Participant } from "../../types";
import { createMuiFormModal } from "../Modal/Modal-factory";
import "./GroupContainer.css";

const styles = createStyles((theme: Theme) => ({
  head: {
    backgroundColor: "#000",
    color: "#fff",
  },
  errorCard: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  highestRow: {
    backgroundColor: "rgba(164, 0, 7, 0.87)",
  },
  lowestRow: {
    backgroundColor: "rgba(0, 84, 133, 0.87)",
  },
}));

interface Props extends WithStyles {
  ownedIndex: number;
  groups: Group[];
  participants?: Participant[];
  onGroupChange?: (g: Group) => void;
}

interface State {
  hasDistancer: boolean;
  distancerId: string;
  rawGroupName: string;
  validGroupName: string;
  selectedParticipantsIds: string[];
  expansionShown: boolean;
  addMemberModalShown: boolean;
  removeMemberModalShown: boolean;
}

class GroupContainer extends React.Component<Props, State> {
  // TODO (Coul Greer): Remove any static variables/functions that are made public for testing
  static getDefaultChaseName() {
    return "DEFAULT Chase";
  }

  static get EXPANSION_PREFIX() {
    return "group-container-expansion";
  }

  static get PLACEHOLDER_MEMBER_NAME() {
    return "---";
  }

  static get PLACEHOLDER_MEMBER_MOVEMENT_RATE() {
    return "N/A";
  }

  private id;

  private currentGroup;

  private lowestMovementRateMember: Participant | null;

  private highestMovementRateMember: Participant | null;

  constructor(props: Props) {
    super(props);

    const { groups, ownedIndex } = this.props;
    this.currentGroup = groups[ownedIndex];
    this.state = {
      hasDistancer: true,
      distancerId: "",
      rawGroupName: this.currentGroup.name,
      validGroupName: this.currentGroup.name,
      selectedParticipantsIds: [],
      expansionShown: false,
      addMemberModalShown: false,
      removeMemberModalShown: false,
    };

    this.id = nanoid();

    this.lowestMovementRateMember = null;
    this.highestMovementRateMember = null;

    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleDistancerChange = this.handleDistancerChange.bind(this);
    this.handleParticipantCheckboxChange =
      this.handleParticipantCheckboxChange.bind(this);

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleNameBlur = this.handleNameBlur.bind(this);

    this.handleInitiateMemberAdditionClick =
      this.handleInitiateMemberAdditionClick.bind(this);
    this.handleCancelMemberAdditionClick =
      this.handleCancelMemberAdditionClick.bind(this);
    this.handleMemberAdditionSubmit =
      this.handleMemberAdditionSubmit.bind(this);

    this.handleInitiateMemberRemovalClick =
      this.handleInitiateMemberRemovalClick.bind(this);
    this.handleCancelMemberRemovalClick =
      this.handleCancelMemberRemovalClick.bind(this);
    this.handleMemberRemovalSubmit = this.handleMemberRemovalSubmit.bind(this);

    this.findParticipantById = this.findParticipantById.bind(this);
    this.isAvailable = this.isAvailable.bind(this);

    this.renderOption = this.renderOption.bind(this);
    this.renderMember = this.renderMember.bind(this);
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    const { groups, ownedIndex } = props;
    const { validGroupName } = state;
    const tempGroup = groups[ownedIndex];

    if (tempGroup.name !== validGroupName) {
      return { rawGroupName: tempGroup.name, validGroupName: tempGroup.name };
    }

    return null;
  }

  private handleToggleClick() {
    this.setState((state) => ({
      expansionShown: !state.expansionShown,
    }));
  }

  private handleDistancerChange(event: React.ChangeEvent<{ value: unknown }>) {
    const { groups, onGroupChange } = this.props;
    const { value } = event.target;
    const { distancer: oldDistancer } = this.currentGroup;
    const newDistancer = groups.find(({ id }) => id === value) ?? null;

    this.removeDistancer();
    this.addDistancer(newDistancer);

    this.setState({
      hasDistancer: this.hasDistancer(),
      distancerId: value as string,
    });

    if (onGroupChange) {
      onGroupChange(this.currentGroup);
      if (newDistancer) onGroupChange(newDistancer);
      if (oldDistancer) onGroupChange(oldDistancer);
    }
  }

  private handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    if (value) {
      this.currentGroup.name = value;
      this.setState({ validGroupName: value });
    }

    this.setState({ rawGroupName: value });
  }

  private handleNameBlur() {
    const { onGroupChange } = this.props;

    this.setState((state) => {
      if (onGroupChange) onGroupChange(this.currentGroup);

      return { rawGroupName: state.validGroupName };
    });
  }

  private handleInitiateMemberAdditionClick() {
    this.setState({ selectedParticipantsIds: [], addMemberModalShown: true });
  }

  private handleCancelMemberAdditionClick() {
    this.setState({ addMemberModalShown: false });
  }

  private handleMemberAdditionSubmit() {
    const { onGroupChange } = this.props;
    const { selectedParticipantsIds } = this.state;
    const { participants: currentParticipants } = this.currentGroup;

    const selectedParticipants = selectedParticipantsIds
      .map(this.findParticipantById)
      .filter((participant): participant is Participant => !!participant);

    selectedParticipants.forEach((participant) => {
      const p = participant;
      p.isGrouped = true;
    });
    currentParticipants.push(...selectedParticipants);

    if (onGroupChange) onGroupChange(this.currentGroup);

    this.handleCancelMemberAdditionClick();
  }

  private handleInitiateMemberRemovalClick() {
    this.setState({
      selectedParticipantsIds: [],
      removeMemberModalShown: true,
    });
  }

  private handleCancelMemberRemovalClick() {
    this.setState({ removeMemberModalShown: false });
  }

  private handleMemberRemovalSubmit() {
    const { onGroupChange } = this.props;
    const { selectedParticipantsIds } = this.state;
    const { participants: currentParticipants } = this.currentGroup;

    const selectedParticipants = selectedParticipantsIds
      .map(this.findParticipantById)
      .filter((participant): participant is Participant => !!participant);
    const selectedParticipantsIndices = selectedParticipantsIds
      .map((selectedParticipantId) =>
        currentParticipants.findIndex(({ id }) => selectedParticipantId === id)
      )
      .sort();

    selectedParticipants.forEach((participant) => {
      const p = participant;
      p.isGrouped = false;
    });
    selectedParticipantsIndices.forEach((index, i) => {
      currentParticipants.splice(index - i, 1);
    });

    if (onGroupChange) onGroupChange(this.currentGroup);

    this.handleCancelMemberRemovalClick();
  }

  private handleParticipantCheckboxChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { value, checked } = event.target;

    this.setState(({ selectedParticipantsIds }) => {
      if (checked) {
        selectedParticipantsIds.push(value);
      } else {
        const targetIndex = selectedParticipantsIds.indexOf(value);
        selectedParticipantsIds.splice(targetIndex, 1);
      }

      return { selectedParticipantsIds };
    });
  }

  private getBoundaryClassName(participant: Participant) {
    const { classes } = this.props;
    const { movementRate } = participant;

    if (this.areBoundariesEqual()) return "";

    if (this.isHighestBoundary(movementRate)) {
      return classes.highestRow;
    }

    if (this.isLowestBoundary(movementRate)) {
      return classes.lowestRow;
    }

    return "";
  }

  private findMemberWithHighestMovementRate() {
    const { participants } = this.currentGroup;

    if (participants.length <= 0) return null;

    let result = participants[0];

    participants.forEach((participant) => {
      if (participant.movementRate > result.movementRate) result = participant;
    });

    return result;
  }

  private findMemberWithLowestMovementRate() {
    const { participants } = this.currentGroup;

    if (participants.length <= 0) return null;

    let result = participants[0];

    participants.forEach((participant) => {
      if (participant.movementRate < result.movementRate) result = participant;
    });

    return result;
  }

  private findParticipantById(targetId: string) {
    const { participants } = this.props;

    if (!participants) return undefined;

    return participants.find(({ id }) => targetId === id);
  }

  private hasBoundaryMovementRate(participant: Participant) {
    const { movementRate } = participant;

    return (
      this.isHighestBoundary(movementRate) ||
      this.isLowestBoundary(movementRate)
    );
  }

  private areBoundariesEqual() {
    return this.highestMovementRateMember === this.lowestMovementRateMember;
  }

  private isHighestBoundary(movementRate: number) {
    if (!this.highestMovementRateMember) return false;

    return this.highestMovementRateMember.movementRate === movementRate;
  }

  private isLowestBoundary(movementRate: number) {
    if (!this.lowestMovementRateMember) return false;

    return this.lowestMovementRateMember.movementRate === movementRate;
  }

  private isAvailable({ id: targetId, isGrouped }: Participant) {
    if (isGrouped) return false;

    const { participants: ownedParticipants } = this.currentGroup;
    let isAvailable = true;

    ownedParticipants.forEach(({ id }) => {
      if (id === targetId) isAvailable = false;
    });

    return isAvailable;
  }

  private hasDistancer() {
    const { distancer } = this.currentGroup;

    return distancer !== null;
  }

  private hasValidParticipantCount() {
    const { participants } = this.props;

    return participants && participants.length > 0;
  }

  private hasPursuers() {
    const { pursuers } = this.currentGroup;

    return pursuers.length > 0;
  }

  private hasMembers() {
    const { participants } = this.currentGroup;

    return participants.length > 0;
  }

  private removeDistancer() {
    if (!this.currentGroup.distancer) return;

    const { onGroupChange } = this.props;
    const { id: currentGroupId, distancer: oldDistancer } = this.currentGroup;
    const { pursuers } = oldDistancer;
    const pursuerIndex = pursuers.findIndex(({ id }) => id === currentGroupId);

    pursuers.splice(pursuerIndex, 1);

    this.currentGroup.distancer = null;

    if (onGroupChange) onGroupChange(oldDistancer);
  }

  private addDistancer(distancer: Group | null) {
    this.currentGroup.distancer = distancer;

    if (distancer === null) return;

    distancer.pursuers.push(this.currentGroup);
  }

  private renderGroupData() {
    const { rawGroupName, expansionShown } = this.state;

    const headerId = `group-header-${this.id}`;
    const contentId = `${GroupContainer.EXPANSION_PREFIX}-${this.id}`;
    const expandMoreIcon = (
      <span className="material-icons" aria-hidden>
        expand_more
      </span>
    );

    return (
      <Accordion
        square
        expanded={expansionShown}
        onChange={this.handleToggleClick}
      >
        <AccordionSummary
          id={headerId}
          expandIcon={expandMoreIcon}
          aria-label={`Group details: ${rawGroupName}`}
          aria-controls={contentId}
        >
          <TextField
            id={`group-name-${this.id}`}
            label="Name"
            color="secondary"
            value={rawGroupName}
            onChange={this.handleNameChange}
            onBlur={this.handleNameBlur}
          />
        </AccordionSummary>
        <AccordionDetails id={contentId}>
          <Box p={1}>
            <Grid container direction="column" spacing={2}>
              <Grid item>{GroupContainer.renderChaseName()}</Grid>
              <Grid item>{this.renderDistancer()}</Grid>
              <Grid item>{this.renderPursuers()}</Grid>
              <Grid item>{this.renderMembers()}</Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  }

  private static renderChaseName() {
    return (
      <Typography variant="h2">
        Chase Name: <em>{GroupContainer.getDefaultChaseName()}</em>
      </Typography>
    );
  }

  private renderDistancer() {
    const { groups } = this.props;
    const { hasDistancer, distancerId } = this.state;

    const selectId = `distancer-select-${this.id}`;

    return (
      <FormControl
        fullWidth
        variant="outlined"
        color="secondary"
        error={!hasDistancer}
      >
        <InputLabel htmlFor={selectId}>Distancer</InputLabel>
        <NativeSelect
          id={selectId}
          value={distancerId}
          onChange={this.handleDistancerChange}
        >
          <option key="default" aria-label="None" value="" />
          {groups.map(this.renderOption)}
        </NativeSelect>
        {!hasDistancer && (
          <FormHelperText role="alert">
            No valid distancer selected
            <br />
            <q>
              No appetite for the hunt? In due time it will come. It always
              does...
            </q>
          </FormHelperText>
        )}
      </FormControl>
    );
  }

  private renderPursuers() {
    const { classes } = this.props;
    const { pursuers } = this.currentGroup;

    const pursuerLabelId = `pursuers-heading-${this.id}`;

    return (
      <Card
        variant="outlined"
        classes={{ root: this.hasPursuers() ? undefined : classes.errorCard }}
      >
        <CardContent>
          <Typography variant="h2" id={pursuerLabelId}>
            Pursuers
          </Typography>
          <Divider />
          {this.hasPursuers() ? (
            <List aria-labelledby={pursuerLabelId}>
              {pursuers.map(({ id }) => (
                <ListItem key={id}>{id}</ListItem>
              ))}
            </List>
          ) : (
            <Typography component="p" variant="body2" role="alert">
              No pursuers for this group
              <br />
              <q>
                These little birds fly free. They haven&apos;t noticed, yet.
              </q>
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  private renderMembers() {
    const { participants: currentParticipants } = this.currentGroup;

    this.highestMovementRateMember = this.findMemberWithHighestMovementRate();
    this.lowestMovementRateMember = this.findMemberWithLowestMovementRate();

    return (
      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <caption>
              <Typography variant="h2">Members</Typography>
            </caption>
            <TableHead>{this.renderMemberHeader()}</TableHead>
            <TableBody>
              {this.hasMembers()
                ? currentParticipants.map(this.renderMember)
                : this.renderMemberWarning()}
            </TableBody>
          </Table>
          <Box p={1}>
            <ButtonGroup>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleInitiateMemberAdditionClick}
                disabled={!this.hasValidParticipantCount()}
              >
                ADD
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleInitiateMemberRemovalClick}
                disabled={!this.hasMembers()}
              >
                REMOVE
              </Button>
            </ButtonGroup>
          </Box>
        </TableContainer>
      </Paper>
    );
  }

  private renderMemberAdditionModal() {
    const { participants } = this.props;
    const { addMemberModalShown } = this.state;

    const availableParticipants = participants?.filter(this.isAvailable) ?? [];

    const Content = (
      <Box p={2}>
        <form onSubmit={this.handleMemberAdditionSubmit}>
          <DialogContent dividers>
            {availableParticipants.length > 0 ? (
              <FormGroup>
                {availableParticipants.map(({ id, name }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={id}
                        onChange={this.handleParticipantCheckboxChange}
                      />
                    }
                    label={name}
                    key={id}
                  />
                ))}
              </FormGroup>
            ) : (
              <DialogContentText component="p">
                No available participants
                <br />
                <q>
                  A place void of life... past or present. All claimed. None
                  free.
                </q>
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleCancelMemberAdditionClick}
            >
              CANCEL
            </Button>
            <Button
              variant="text"
              color="secondary"
              type="submit"
              disabled={!(availableParticipants.length > 0)}
            >
              ADD
            </Button>
          </DialogActions>
        </form>
      </Box>
    );

    return (
      addMemberModalShown &&
      createMuiFormModal(
        addMemberModalShown,
        "Select participants to add to group",
        Content,
        this.handleCancelMemberAdditionClick
      )
    );
  }

  private renderMemberRemovalModal() {
    const { removeMemberModalShown } = this.state;
    const { participants } = this.currentGroup;

    const Content = (
      <Box p={2}>
        <form onSubmit={this.handleMemberRemovalSubmit}>
          <DialogContent dividers>
            <FormGroup>
              {participants.map(({ id, name }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      value={id}
                      onChange={this.handleParticipantCheckboxChange}
                    />
                  }
                  label={name}
                  key={id}
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleCancelMemberRemovalClick}
            >
              CANCEL
            </Button>
            <Button variant="text" color="secondary" type="submit">
              REMOVE
            </Button>
          </DialogActions>
        </form>
      </Box>
    );

    return (
      removeMemberModalShown &&
      createMuiFormModal(
        removeMemberModalShown,
        "Remove members from group",
        Content,
        this.handleCancelMemberRemovalClick
      )
    );
  }

  private renderOption({ id, name }: Group, index: number) {
    const { ownedIndex } = this.props;

    return (
      ownedIndex !== index && (
        <option key={id} value={id}>
          {name}
        </option>
      )
    );
  }

  private renderMemberHeader() {
    const { classes } = this.props;
    const highestRowClasses = classnames({
      [classes.highestRow]: !this.areBoundariesEqual(),
    });
    const lowestRowClasses = classnames({
      [classes.lowestRow]: !this.areBoundariesEqual(),
    });

    return (
      <>
        <TableRow
          classes={{ root: highestRowClasses }}
          aria-label="Member with the highest MOV"
        >
          <TableCell align="center">
            <span className="material-icons-outlined">arrow_upward</span>
          </TableCell>
          <TableCell>
            {this.highestMovementRateMember?.name ||
              GroupContainer.PLACEHOLDER_MEMBER_NAME}
          </TableCell>
          <TableCell align="right">
            {this.highestMovementRateMember?.movementRate ||
              GroupContainer.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
          </TableCell>
        </TableRow>
        <TableRow
          classes={{ root: lowestRowClasses }}
          aria-label="Member with the lowest MOV"
        >
          <TableCell align="center">
            <span className="material-icons-outlined">arrow_downward</span>
          </TableCell>
          <TableCell>
            {this.lowestMovementRateMember?.name ||
              GroupContainer.PLACEHOLDER_MEMBER_NAME}
          </TableCell>
          <TableCell align="right">
            {this.lowestMovementRateMember?.movementRate ||
              GroupContainer.PLACEHOLDER_MEMBER_MOVEMENT_RATE}
          </TableCell>
        </TableRow>
        <TableRow classes={{ root: classes.head }}>
          <TableCell align="center" aria-label="icon" />
          <TableCell align="center">Name</TableCell>
          <TableCell align="center">MOV</TableCell>
        </TableRow>
      </>
    );
  }

  private renderMember(participant: Participant) {
    const rowClasses = classnames([this.getBoundaryClassName(participant)]);

    return (
      <TableRow
        classes={{ root: rowClasses }}
        aria-label={participant.name}
        key={participant.id}
      >
        <TableCell
          align="center"
          aria-hidden={!this.hasBoundaryMovementRate(participant)}
        >
          <span className="material-icons-outlined">warning</span>
        </TableCell>
        <TableCell>{participant.name}</TableCell>
        <TableCell align="right">{participant.movementRate}</TableCell>
      </TableRow>
    );
  }

  private renderMemberWarning() {
    const { classes } = this.props;

    return (
      <TableRow>
        <TableCell className={classes.errorCard} colSpan={3}>
          <Typography variant="body2">
            No members exist in this group.
            <br />
            <q>An emptiness, yet to be filled. This vessel lacks purpose.</q>
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  render() {
    return (
      <div className="GroupContainer">
        {this.renderGroupData()}
        {this.renderMemberAdditionModal()}
        {this.renderMemberRemovalModal()}
      </div>
    );
  }
}

export default withStyles(styles)(GroupContainer);
